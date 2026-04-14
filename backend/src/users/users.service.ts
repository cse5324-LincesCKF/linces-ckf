import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_BCRYPT_ROUNDS } from '../common/constants/auth.constants';
import { UserRole } from '../common/constants/roles.constant';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './users.repository';
import { User } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async createUser(input: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findByEmailWithPassword(
      input.email ?? '',
    );

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.usersRepository.create({
      ...input,
      email: input.email?.toLowerCase(),
    });

    return this.usersRepository.save(user);
  }

  async getProfile(userId: string) {
    const user = await this.findUserOrFail(userId);
    return this.toSafeUser(user);
  }

  async updateUser(
    authenticatedUserId: string,
    targetUserId: string,
    dto: UpdateUserDto,
  ) {
    this.assertSelfAccess(authenticatedUserId, targetUserId);
    const user = await this.findUserOrFail(targetUserId);

    Object.assign(user, dto);

    return this.toSafeUser(await this.usersRepository.save(user));
  }

  async changePassword(
    authenticatedUserId: string,
    targetUserId: string,
    dto: UpdatePasswordDto,
  ) {
    this.assertSelfAccess(authenticatedUserId, targetUserId);
    const user = await this.findUserWithPasswordOrFail(targetUserId);
    const matches = await bcrypt.compare(dto.oldPassword, user.passwordHash);

    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, this.getRounds());
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async deleteUser(authenticatedUserId: string, targetUserId: string) {
    this.assertSelfAccess(authenticatedUserId, targetUserId);
    const user = await this.findUserOrFail(targetUserId);

    await this.usersRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }

  async getActiveUserOrFail(userId: string): Promise<User> {
    const user = await this.findUserOrFail(userId);

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    return user;
  }

  async getAdminVisibleUsers() {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toAdminSummary(user));
  }

  async countUsers(): Promise<number> {
    return this.usersRepository.countAll();
  }

  private async findUserOrFail(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async findUserWithPasswordOrFail(userId: string): Promise<User> {
    const user = await this.usersRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private assertSelfAccess(authenticatedUserId: string, targetUserId: string): void {
    if (authenticatedUserId !== targetUserId) {
      throw new ForbiddenException('You can only manage your own account');
    }
  }

  private getRounds(): number {
    return Number(this.configService.get('BCRYPT_ROUNDS')) || DEFAULT_BCRYPT_ROUNDS;
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      languagePreference: user.languagePreference,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toAdminSummary(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
