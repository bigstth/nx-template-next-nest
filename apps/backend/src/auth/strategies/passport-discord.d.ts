declare module 'passport-discord' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string | null;
    verified?: boolean;
    locale?: string;
    mfa_enabled?: boolean;
    provider: 'discord';
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void,
      ) => void,
    );
    name: string;
  }
}
