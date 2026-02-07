import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { RegisterRequestInterface, UserRole } from '@vcafe/shared-interfaces';

export class RegisterRequestDto implements RegisterRequestInterface {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;
}
