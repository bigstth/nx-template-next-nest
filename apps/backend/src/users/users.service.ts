import { Injectable } from '@nestjs/common';
import type { UserRole } from '@vcafe/shared-interfaces';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: true },
    });
  }

  async findByProviderAndId(provider: string, providerId: string) {
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: {
          include: { oauthAccounts: true },
        },
      },
    });
    return oauthAccount?.user;
  }

  async create(data: any) {
    return this.prisma.user.create({
      data,
      include: { oauthAccounts: true },
    });
  }

  async createFromOAuth(data: {
    email: string | null;
    provider: string;
    providerId: string;
    displayName: string;
    avatar: string | null;
    role: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email ?? null, // Allow null for OAuth users without email
        password: null, // OAuth users don't have password
        displayName: data.displayName,
        avatar: data.avatar,
        role: data.role as UserRole,
        oauthAccounts: {
          create: {
            provider: data.provider,
            providerId: data.providerId,
          },
        },
      },
      include: { oauthAccounts: true },
    });
  }

  async linkOAuthProvider(
    userId: string,
    oauthData: {
      provider: string;
      providerId: string;
      displayName: string;
      avatar: string | null;
    },
  ) {
    // Check if this OAuth account is already linked
    const existingLink = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
        },
      },
    });

    if (existingLink && existingLink.userId !== userId) {
      throw new Error('This OAuth account is already linked to another user');
    }

    if (existingLink) {
      // Already linked to this user, just return user
      return this.findById(userId);
    }

    // Link new OAuth account to existing user
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: oauthData.displayName,
        avatar: oauthData.avatar,
        oauthAccounts: {
          create: {
            provider: oauthData.provider,
            providerId: oauthData.providerId,
          },
        },
      },
      include: { oauthAccounts: true },
    });
  }

  async updateOAuthProfile(
    userId: string,
    profile: {
      displayName: string;
      avatar: string | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: profile.displayName,
        avatar: profile.avatar,
      },
      include: { oauthAccounts: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { oauthAccounts: true },
    });
  }
}
