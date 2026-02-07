import { Controller } from '@nestjs/common';
import { Post, Body, Request, UseGuards, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { DiscordAuthGuard } from './guards/discord-auth.guard';
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

  // Google OAuth
  /**
   * Initiates Google OAuth 2.0 authentication flow.
   * User will be redirected to Google's consent screen.
   * No return value as Passport handles the redirect.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req: any): Promise<void> {
    // Guard intercepts and redirects to Google OAuth
    // This method body will never execute
  }

  /**
   * Google OAuth callback endpoint.
   * Receives auth code from Google, validates user, and redirects to frontend.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const loginResponse = await this.authService.login(req.user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', loginResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${loginResponse.access_token}`,
    );
  }

  // Facebook OAuth
  /**
   * Initiates Facebook OAuth 2.0 authentication flow.
   * User will be redirected to Facebook's consent screen.
   */
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth(@Request() req: any): Promise<void> {
    // Guard intercepts and redirects to Facebook OAuth
  }

  /**
   * Facebook OAuth callback endpoint.
   */
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthCallback(
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const loginResponse = await this.authService.login(req.user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', loginResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${loginResponse.access_token}`,
    );
  }

  // Discord OAuth
  /**
   * Initiates Discord OAuth 2.0 authentication flow.
   * User will be redirected to Discord's authorization screen.
   */
  @Get('discord')
  @UseGuards(DiscordAuthGuard)
  async discordAuth(@Request() req: any): Promise<void> {
    // Guard intercepts and redirects to Discord OAuth
  }

  /**
   * Discord OAuth callback endpoint.
   */
  @Get('discord/callback')
  @UseGuards(DiscordAuthGuard)
  async discordAuthCallback(
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const loginResponse = await this.authService.login(req.user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', loginResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${loginResponse.access_token}`,
    );
  }
}
