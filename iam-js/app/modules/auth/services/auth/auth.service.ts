import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@app/modules/user/services/user/user.service';
import { TokenService } from '@auth/services/token/token.service';
import { verify } from 'argon2';
import { SignUpDto } from '@auth/dto/signup.dto';
import { SignInDto } from '@auth/dto/signin.dto';
import { TokenPair } from '@auth/interfaces/token-pair.interface';
import { Session } from '@auth/entities/session.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuthProfile } from '../../interfaces/oauth-profile.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<void> {
    await this.userService.create(signUpDto);
  }

  async signin(signInDto: SignInDto): Promise<TokenPair> {
    const user = await this.userService.findByEmail(signInDto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await verify(user.password, signInDto.password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    await this.saveSignIn(user.id);

    return this.tokenService.generateTokenPair(user.id);
  }

  async oauthSignin(profile: OAuthProfile): Promise<TokenPair> {
    const dto: OAuthProfile = {
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };

    const user = await this.userService.findOrCreateUser(dto);
    await this.saveSignIn(user.id);
    return this.tokenService.generateTokenPair(user.id);
  }

  async refresh(userId: string, refreshToken: string): Promise<TokenPair> {
    return this.tokenService.rotateTokens(userId, refreshToken);
  }

  async signout(userId: string): Promise<void> {
    await this.saveSignOut(userId);
    await this.tokenService.revokeAllTokens(userId);
  }

  private async saveSignIn(userId: string): Promise<void> {
    const session = this.sessionRepository.create({
      user: { id: userId },
      loginAt: new Date(),
      logoutAt: null,
    });
    await this.sessionRepository.save(session);
  }

  private async saveSignOut(userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        logoutAt: IsNull(),
      },
      order: { loginAt: 'DESC' },
    });

    if (session) {
      session.logoutAt = new Date();
      await this.sessionRepository.save(session);
    }
  }
}
