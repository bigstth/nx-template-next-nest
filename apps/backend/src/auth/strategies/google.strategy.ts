import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    try {
      const email = emails && emails.length > 0 ? emails[0].value : null;
      const user = await this.authService.validateOAuthUser({
        provider: 'google',
        providerId: id,
        email: email,
        displayName: displayName || email?.split('@')[0] || `User${id}`,
        avatar: photos && photos.length > 0 ? photos[0].value : null,
      });

      done(null, user || false);
    } catch (error) {
      done(error, false);
    }
  }
}
