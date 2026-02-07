import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto';
import { UserRole } from '@vcafe/shared-interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
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
    userId: string,
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
    // 1. Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Validate password strength
    this.validatePasswordStrength(registerDto.password);

    // 3. Sanitize email (lowercase, trim)
    const sanitizedEmail = registerDto.email.toLowerCase().trim();

    // 4. Hash password with secure salt rounds
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    try {
      // 5. Create user
      const user = await this.usersService.create({
        ...registerDto,
        email: sanitizedEmail,
        password: hashedPassword,
      });

      // 6. Map to DTO (password excluded, role type converted)
      return new RegisterResponseDto({
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      // Handle database errors
      if (error.code === '23505') {
        // Unique constraint violation (PostgreSQL)
        throw new ConflictException('Email is already registered');
      }
      throw new BadRequestException('Failed to register user');
    }
  }

  async validateOAuthUser(profile: {
    provider: string;
    providerId: string;
    email: string | null;
    displayName: string;
    avatar: string | null;
  }) {
    // Try to find user by provider and providerId
    let user = await this.usersService.findByProviderAndId(
      profile.provider,
      profile.providerId,
    );

    if (user) {
      // User exists, update display name and avatar if changed
      if (
        user.displayName !== profile.displayName ||
        user.avatar !== profile.avatar
      ) {
        user = await this.usersService.updateOAuthProfile(user.id, {
          displayName: profile.displayName,
          avatar: profile.avatar,
        });
      }
      return user;
    }

    // If user doesn't exist, check if email is already registered with another provider
    if (profile.email) {
      const existingUser = await this.usersService.findByEmail(profile.email);
      if (existingUser) {
        // Email exists but with different provider - link accounts
        return await this.usersService.linkOAuthProvider(existingUser.id, {
          provider: profile.provider,
          providerId: profile.providerId,
          displayName: profile.displayName,
          avatar: profile.avatar,
        });
      }
    }

    // Create new user from OAuth profile
    return await this.usersService.createFromOAuth({
      email: profile.email,
      provider: profile.provider,
      providerId: profile.providerId,
      displayName: profile.displayName,
      avatar: profile.avatar,
      role: UserRole.USER, // Default role for OAuth users
    });
  }

  private validatePasswordStrength(password: string): void {
    // Password must be at least 6 characters (validated by DTO)
    // Additional strength checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    const strengthCount = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (strengthCount < 3) {
      throw new BadRequestException(
        'Password must contain at least 3 of the following: uppercase letter, lowercase letter, number, special character',
      );
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      '12345678',
      'qwerty',
      'admin',
      'letmein',
    ];
    if (
      commonPasswords.some((common) => password.toLowerCase().includes(common))
    ) {
      throw new BadRequestException('Password is too common or weak');
    }
  }
}
