import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequestInterface } from '@vcafe/shared-interfaces';

export class LoginRequestDto implements LoginRequestInterface {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
