import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

/**
 * Generic error handler that transforms errors into appropriate HTTP exceptions.
 * If no specific error type is matched, returns 500 Internal Server Error.
 *
 * @param error - The error object to handle
 * @param defaultMessage - Optional default message for 500 errors
 * @throws HttpException with appropriate status code
 */
export function handleError(
  error: any,
  defaultMessage = 'An unexpected error occurred. Please try again.',
): never {
  // Already an HTTP exception, just throw it
  if (error instanceof HttpException) {
    throw error;
  }

  // Database unique constraint violation (PostgreSQL/Prisma)
  if (
    error.code === 'P2002' || // Prisma unique constraint
    error.code === '23505' // PostgreSQL unique violation
  ) {
    throw new ConflictException(error.message || 'Resource already exists');
  }

  // Database foreign key constraint violation
  if (
    error.code === 'P2003' || // Prisma foreign key constraint
    error.code === '23503' // PostgreSQL foreign key violation
  ) {
    throw new BadRequestException('Invalid reference to related resource');
  }

  // Database not found (Prisma)
  if (error.code === 'P2025') {
    throw new NotFoundException('Resource not found');
  }

  // Validation errors
  if (
    error.message?.includes('validation') ||
    error.name === 'ValidationError'
  ) {
    throw new BadRequestException(error.message || 'Validation failed');
  }

  // JWT/Authentication errors
  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError' ||
    error.message?.includes('jwt') ||
    error.message?.includes('token')
  ) {
    throw new UnauthorizedException(
      error.message || 'Invalid or expired token',
    );
  }

  // Default: Internal Server Error
  throw new InternalServerErrorException(defaultMessage);
}

/**
 * Specialized error handler for authentication operations.
 * Handles common auth-related errors like duplicate emails, invalid credentials, etc.
 *
 * @param error - The error object to handle
 * @param operation - The auth operation type ('register', 'login', 'refresh', etc.)
 * @throws HttpException with appropriate status code
 */
export function handleAuthError(
  error: any,
  operation: 'register' | 'login' | 'refresh' | 'logout' | 'oauth',
): never {
  // Already an HTTP exception, just throw it
  if (error instanceof HttpException) {
    throw error;
  }

  // Operation-specific error messages
  const errorMessages = {
    register: 'Registration failed. Please try again.',
    login: 'Login failed. Please try again.',
    refresh: 'Token refresh failed. Please login again.',
    logout: 'Logout failed. Please try again.',
    oauth: 'OAuth authentication failed. Please try again.',
  };

  // Email already exists
  if (
    error.message?.includes('already exists') ||
    error.message?.includes('duplicate') ||
    error.code === 'P2002'
  ) {
    throw new ConflictException('Email already exists');
  }

  // Invalid credentials (for login)
  if (
    operation === 'login' &&
    (error.message?.includes('credentials') ||
      error.message?.includes('password') ||
      error.message?.includes('Unauthorized'))
  ) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // Token errors (for refresh)
  if (
    operation === 'refresh' &&
    (error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.message?.includes('token'))
  ) {
    throw new UnauthorizedException(
      'Invalid refresh token. Please login again.',
    );
  }

  // Validation errors
  if (
    error.message?.includes('validation') ||
    error.name === 'ValidationError'
  ) {
    throw new BadRequestException(error.message || 'Validation failed');
  }

  // Default: Use operation-specific message
  throw new InternalServerErrorException(errorMessages[operation]);
}

/**
 * Specialized error handler for database operations.
 * Handles Prisma and PostgreSQL specific errors.
 *
 * @param error - The error object to handle
 * @param defaultMessage - Optional default message for 500 errors
 * @throws HttpException with appropriate status code
 */
export function handleDatabaseError(
  error: any,
  defaultMessage = 'Database operation failed. Please try again.',
): never {
  // Already an HTTP exception, just throw it
  if (error instanceof HttpException) {
    throw error;
  }

  // Prisma/PostgreSQL error codes
  const errorMap: Record<string, { status: any; message: string }> = {
    P2000: {
      status: BadRequestException,
      message: 'Value too long for column',
    },
    P2001: {
      status: NotFoundException,
      message: 'Record not found',
    },
    P2002: {
      status: ConflictException,
      message: 'Unique constraint violation',
    },
    P2003: {
      status: BadRequestException,
      message: 'Foreign key constraint violation',
    },
    P2025: {
      status: NotFoundException,
      message: 'Record to update not found',
    },
    '23505': {
      status: ConflictException,
      message: 'Duplicate key value',
    },
    '23503': {
      status: BadRequestException,
      message: 'Foreign key violation',
    },
    '23502': {
      status: BadRequestException,
      message: 'Not null violation',
    },
  };

  if (error.code && errorMap[error.code]) {
    const { status: ExceptionClass, message } = errorMap[error.code];
    throw new ExceptionClass(message);
  }

  // Default: Internal Server Error
  throw new InternalServerErrorException(defaultMessage);
}
