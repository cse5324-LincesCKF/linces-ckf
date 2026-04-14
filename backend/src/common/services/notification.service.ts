import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  sendOrderConfirmation(userId: string, orderId: string): void {
    this.logger.log(
      `Simulated order confirmation notification for user ${userId} and order ${orderId}`,
    );
  }
}
