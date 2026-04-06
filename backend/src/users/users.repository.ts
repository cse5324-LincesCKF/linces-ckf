import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface IUsersRepository {
  create(data: Partial<User>): User;
  save(user: User, manager?: EntityManager): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByIdWithPassword(id: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  countAll(): Promise<number>;
  remove(user: User, manager?: EntityManager): Promise<void>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  save(user: User, manager?: EntityManager): Promise<User> {
    return this.getRepository(manager).save(user);
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  findAll(): Promise<User[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  countAll(): Promise<number> {
    return this.repository.count();
  }

  async remove(user: User, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).remove(user);
  }

  private getRepository(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this.repository;
  }
}
