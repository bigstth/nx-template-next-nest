import { Controller } from '@nestjs/common';
import { Post, Body, Request, UseGuards, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.authService.login(req.user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', loginResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return new LoginResponseDto({
      access_token: loginResponse.access_token,
      user: req.user,
    });
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: any): Promise<RefreshResponseDto> {
    const { userId, email, role } = req.user;
    return this.authService.refreshAccessToken(userId, email, role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
