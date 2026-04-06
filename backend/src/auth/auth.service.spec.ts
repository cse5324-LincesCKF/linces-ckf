import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from '../common/constants/roles.constant';
import { USERS_REPOSITORY } from '../users/users.repository';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersRepository = {
    findByEmailWithPassword: jest.fn(),
  };
  const usersService = {
    createUser: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };
  const configService = {
    get: jest.fn().mockReturnValue('10'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('registers a user and returns an access token', async () => {
    usersService.createUser.mockResolvedValue({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: UserRole.CUSTOMER,
      isActive: true,
      languagePreference: 'EN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await service.register({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password1',
      role: UserRole.CUSTOMER,
    });

    expect(usersService.createUser).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'alice@example.com',
      role: UserRole.CUSTOMER,
    });
    expect(response.accessToken).toBe('signed-token');
  });

  it('rejects self-registration for administrators', async () => {
    await expect(
      service.register({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password1',
        role: UserRole.ADMINISTRATOR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('logs a user in with valid credentials', async () => {
    usersRepository.findByEmailWithPassword.mockResolvedValue({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: UserRole.CUSTOMER,
      isActive: true,
      languagePreference: 'EN',
      passwordHash: await bcrypt.hash('Password1', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await service.login({
      email: 'alice@example.com',
      password: 'Password1',
    });

    expect(response.accessToken).toBe('signed-token');
    expect(response.user.email).toBe('alice@example.com');
  });

  it('rejects invalid credentials during login', async () => {
    usersRepository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'Password1' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects login when the password does not match the stored hash', async () => {
    usersRepository.findByEmailWithPassword.mockResolvedValue({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: UserRole.CUSTOMER,
      isActive: true,
      languagePreference: 'EN',
      passwordHash: await bcrypt.hash('DifferentPass1', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({ email: 'alice@example.com', password: 'Password1' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns a logout acknowledgement', () => {
    expect(service.logout()).toEqual({
      message: 'Logout successful. Discard the access token on the client.',
    });
  });
});
