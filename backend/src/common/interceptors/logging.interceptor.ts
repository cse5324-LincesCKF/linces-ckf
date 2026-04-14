import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const logPayload = {
          method: request.method,
          path: request.originalUrl ?? request.url,
          statusCode: response.statusCode,
          durationMs,
        };

        if (process.env.NODE_ENV === 'production') {
          this.logger.log(JSON.stringify(logPayload));
          return;
        }

        this.logger.log(
          `${logPayload.method} ${logPayload.path} ${logPayload.statusCode} ${logPayload.durationMs}ms`,
        );
      }),
    );
  }
}
