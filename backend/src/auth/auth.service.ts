import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { DEFAULT_BCRYPT_ROUNDS } from '../common/constants/auth.constants';
import { UserRole } from '../common/constants/roles.constant';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from '../users/users.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    this.ensureRegisterableRole(dto.role);

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      role: dto.role ?? UserRole.CUSTOMER,
      languagePreference: dto.languagePreference,
      passwordHash: await bcrypt.hash(dto.password, this.getRounds()),
      isActive: true,
    });

    return this.buildAuthResponse(user.id, user.email, user.role, user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithPassword(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.email, user.role, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      languagePreference: user.languagePreference,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  logout() {
    return { message: 'Logout successful. Discard the access token on the client.' };
  }

  private buildAuthResponse<T extends object>(
    userId: string,
    email: string,
    role: UserRole,
    user: T,
  ) {
    const payload: JwtPayload = { sub: userId, email, role };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  private ensureRegisterableRole(role?: UserRole): void {
    if (role === UserRole.ADMINISTRATOR) {
      throw new ForbiddenException('Administrator accounts cannot be self-registered');
    }
  }

  private getRounds(): number {
    return Number(this.configService.get('BCRYPT_ROUNDS')) || DEFAULT_BCRYPT_ROUNDS;
  }
}
