import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from './entities/order.entity';

export const ORDERS_REPOSITORY = Symbol('ORDERS_REPOSITORY');

export interface IOrdersRepository {
  create(data: Partial<Order>): Order;
  save(order: Order, manager?: EntityManager): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  countAll(): Promise<number>;
}

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  create(data: Partial<Order>): Order {
    return this.repository.create(data);
  }

  save(order: Order, manager?: EntityManager): Promise<Order> {
    return this.getRepository(manager).save(order);
  }

  findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
  }

  findByUserId(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  countAll(): Promise<number> {
    return this.repository.count();
  }

  private getRepository(manager?: EntityManager): Repository<Order> {
    return manager ? manager.getRepository(Order) : this.repository;
  }
}
