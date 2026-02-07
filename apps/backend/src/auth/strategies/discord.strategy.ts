import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { AuthService } from '../auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      callbackURL: process.env.DISCORD_CALLBACK_URL || '',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ): Promise<any> {
    const { id, email, username, avatar } = profile;

    try {
      const user = await this.authService.validateOAuthUser({
        provider: 'discord',
        providerId: id,
        email: email || null,
        displayName: username,
        avatar: avatar
          ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
          : null,
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
