import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('AppLogger');

  logSuccess(behavior: string, userId: string, additionalData?: any) {
    const logData = {
      behavior,
      userId,
      status: 'success',
      ...additionalData,
    };
    this.logger.log(logData);
  }

  logFailure(
    behavior: string,
    userId: string | null,
    error: string | Error,
    additionalData?: any,
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const logData = {
      behavior,
      userId: userId || 'unknown',
      status: 'failed',
      error: errorMessage,
      ...additionalData,
    };
    this.logger.error(logData);
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
  }
}
