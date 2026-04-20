import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttpException ? exception.getResponse() : null;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isHttpException) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const { message, error } = this.buildErrorBody(payload, isProduction);

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private buildErrorBody(
    payload: string | object | null,
    isProduction: boolean,
  ): { message: string | string[]; error: string } {
    if (!payload) {
      return {
        message: isProduction ? 'Internal server error' : 'Unexpected error',
        error: 'Internal Server Error',
      };
    }

    if (typeof payload === 'string') {
      return { message: payload, error: 'Error' };
    }

    const errorResponse = payload as {
      message?: string | string[];
      error?: string;
    };

    return {
      message: errorResponse.message ?? 'Request failed',
      error: errorResponse.error ?? 'Error',
    };
  }
}
