import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SignUpDto } from '@auth/dto/signup.dto';
import { AuthService } from '@auth/services/auth/auth.service';
import { SignInDto } from '@auth/dto/signin.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { REFRESH_TTL_SEC } from '@auth/services/token/token.service';
import { RefreshGuard } from '@auth/guards/refresh.guard';
import { ValidatedUser } from '@auth/strategies/refresh/refresh.strategy';
import { AuthGuard } from '@auth/guards/auth.guard';
import { User } from '@app/modules/user/entities/user.entity';

const SECURE_ENVIRONMENT = 'production';
const SAME_SITE = 'strict';

export interface AccessToken {
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() dto: SignUpDto): Promise<void> {
    await this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessToken> {
    const tokens = await this.authService.signin(dto);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV')! === SECURE_ENVIRONMENT,
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessToken> {
    const { sub, refreshToken } = req.user as ValidatedUser;

    const tokens = await this.authService.refresh(sub, refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV')! === SECURE_ENVIRONMENT,
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { id } = req.user as User;

    await this.authService.signout(id);

    res.clearCookie('refresh_token');
  }
}
