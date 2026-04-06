import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { USERS_REPOSITORY } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
    countAll: jest.fn(),
  };
  const configService = {
    get: jest.fn().mockReturnValue('10'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('creates a user when the email is available', async () => {
    const createdUser = {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    };
    usersRepository.findByEmailWithPassword.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(createdUser);
    usersRepository.save.mockResolvedValue(createdUser);

    const result = await service.createUser({
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(result).toEqual(createdUser);
    expect(usersRepository.create).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('returns a safe user profile without the password hash', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'CUSTOMER',
      isActive: true,
      languagePreference: 'EN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.getProfile('user-1');

    expect(result.email).toBe('alice@example.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate emails during user creation', async () => {
    usersRepository.findByEmailWithPassword.mockResolvedValue({ id: 'existing' });

    await expect(
      service.createUser({ email: 'alice@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents updating another user account', async () => {
    await expect(
      service.updateUser('user-1', 'user-2', { name: 'Updated' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when updating a user profile that does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(
      service.updateUser('user-1', 'user-1', { name: 'Updated' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates a user profile and returns the safe response', async () => {
    const existingUser = {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'CUSTOMER',
      isActive: true,
      languagePreference: 'EN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    usersRepository.findById.mockResolvedValue(existingUser);
    usersRepository.save.mockResolvedValue({
      ...existingUser,
      name: 'Updated',
    });

    const result = await service.updateUser('user-1', 'user-1', {
      name: 'Updated',
    });

    expect(result.name).toBe('Updated');
  });

  it('changes password when the current password is valid', async () => {
    usersRepository.findByIdWithPassword.mockResolvedValue({
      id: 'user-1',
      passwordHash: await bcrypt.hash('OldPass1', 10),
    });
    usersRepository.save.mockResolvedValue({});

    await expect(
      service.changePassword('user-1', 'user-1', {
        oldPassword: 'OldPass1',
        newPassword: 'NewPass2',
      }),
    ).resolves.toEqual({ message: 'Password updated successfully' });
  });

  it('rejects password changes when the old password is wrong', async () => {
    usersRepository.findByIdWithPassword.mockResolvedValue({
      id: 'user-1',
      passwordHash: await bcrypt.hash('OldPass1', 10),
    });

    await expect(
      service.changePassword('user-1', 'user-1', {
        oldPassword: 'wrong',
        newPassword: 'NewPass2',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when changing the password of a missing user', async () => {
    usersRepository.findByIdWithPassword.mockResolvedValue(null);

    await expect(
      service.changePassword('user-1', 'user-1', {
        oldPassword: 'OldPass1',
        newPassword: 'NewPass2',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deletes a user account owned by the requester', async () => {
    const user = { id: 'user-1' };
    usersRepository.findById.mockResolvedValue(user);
    usersRepository.remove.mockResolvedValue(undefined);

    await expect(service.deleteUser('user-1', 'user-1')).resolves.toEqual({
      message: 'Account deleted successfully',
    });
    expect(usersRepository.remove).toHaveBeenCalledWith(user);
  });

  it('throws when deleting a user that does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(service.deleteUser('user-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when requesting an inactive user account', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-1',
      isActive: false,
    });

    await expect(service.getActiveUserOrFail('user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('returns admin-visible user summaries', async () => {
    usersRepository.findAll.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: new Date(),
      },
    ]);

    const result = await service.getAdminVisibleUsers();

    expect(result[0]).toHaveProperty('email', 'alice@example.com');
  });

  it('returns the total number of users', async () => {
    usersRepository.countAll.mockResolvedValue(7);

    await expect(service.countUsers()).resolves.toBe(7);
  });
});
