import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '',
      scope: ['email'],
      profileFields: ['emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    try {
      const user = await this.authService.validateOAuthUser({
        provider: 'facebook',
        providerId: id,
        email: emails && emails.length > 0 ? emails[0].value : null,
        displayName: displayName || `User${id}`,
        avatar: photos && photos.length > 0 ? photos[0].value : null,
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
