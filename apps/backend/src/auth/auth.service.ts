import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      expiresIn: '7d',
    });

    return new LoginResponseDto({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  }

  async refreshAccessToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<RefreshResponseDto> {
    const payload = { email, sub: userId, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return new RefreshResponseDto({
      access_token: accessToken,
    });
  }

  async register(
    registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashed,
    });

    // Remove password from response
    const { password, ...result } = user;
    return new RegisterResponseDto(result);
  }
}
