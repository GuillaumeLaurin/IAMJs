import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@auth/services/auth/auth.service';
import type { OAuthProfile } from '@auth/interfaces/oauth-profile.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: unknown) => void,
  ): Promise<void> {
    const emails = profile.emails ?? [];
    const email = emails[0]?.value ?? `${profile.username ?? profile.id}@github.noemail`;

    const displayName = profile.displayName ?? profile.username ?? '';
    const [firstName = displayName, ...rest] = displayName.split(' ');
    const lastName = rest.join(' ') || 'Github';

    const oauthProfile: OAuthProfile = {
      provider: 'github',
      providerId: profile.id,
      email,
      firstName,
      lastName,
    };

    const user = await this.authService.oauthSignin(oauthProfile);
    done(null, user);
  }
}
