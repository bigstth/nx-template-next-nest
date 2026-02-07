import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Extract user ID from request if available
    const userId = (request as any).user?.id || null;

    // Determine behavior from path and method
    const behavior = this.getBehavior(request.path, request.method);

    // Log the error
    if (behavior) {
      this.logger.logFailure(behavior, userId, exception as Error, {
        path: request.path,
        method: request.method,
        statusCode: status,
      });
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      message: typeof message === 'string' ? message : (message as any).message,
      ...(typeof message === 'object' && message !== null ? message : {}),
    });
  }

  private getBehavior(path: string, method: string): string | null {
    // Map routes to behaviors
    if (path.includes('/auth/register') && method === 'POST') {
      return 'register';
    }
    if (path.includes('/auth/login') && method === 'POST') {
      return 'login';
    }
    if (
      (path.includes('/auth/google/callback') ||
        path.includes('/auth/facebook/callback') ||
        path.includes('/auth/discord/callback')) &&
      method === 'GET'
    ) {
      return 'oauth-login';
    }
    if (path.includes('/auth/refresh') && method === 'POST') {
      return 'refresh-token';
    }

    // Return generic behavior for other routes
    return `${method.toLowerCase()}-${path.replace(/\//g, '-')}`;
  }
}
