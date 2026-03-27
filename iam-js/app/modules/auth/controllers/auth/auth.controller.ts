import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
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
import { AccessTokenDto } from '@auth/dto/access-token.dto';
import { GoogleGuard } from '@auth/guards/google.guard';
import { GithubGuard } from '@auth/guards/github.guard';
import { TokenPair } from '@auth/interfaces/token-pair.interface';

const SECURE_ENVIRONMENT = 'production';
const SAME_SITE = 'strict';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided credentials.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully registered.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email is already taken by another user.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed (invalid fields).',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Default roles not found — server misconfiguration.',
  })
  async signup(@Body() dto: SignUpDto): Promise<void> {
    await this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in an existing user',
    description:
      'Authenticates the user and returns an access token. A `refresh_token` HttpOnly cookie is also set.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Successfully authenticated. Returns the access token and sets a `refresh_token` cookie.',
    type: AccessTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials (wrong email or password).',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed (invalid fields).',
  })
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const tokens = await this.authService.signin(dto);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE_ENVIRONMENT === this.configService.get('NODE_ENV')!,
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth2 signin' })
  @ApiResponse({ status: 302, description: 'Redirects to Google.' })
  googleSignin(): void {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const tokens = req.user as TokenPair;

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE_ENVIRONMENT === this.configService.get('NODE_ENV'),
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Get('github')
  @UseGuards(GithubGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub.' })
  githubSignin(): void {}

  @Get('github/callback')
  @UseGuards(GithubGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth2 callback' })
  async githubCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const tokens = req.user as TokenPair;

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE_ENVIRONMENT === this.configService.get('NODE_ENV'),
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh the access token',
    description:
      'Rotates the token pair. Requires a valid `refresh_token` cookie. Returns a new access token and sets a new `refresh_token` cookie.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token pair successfully rotated. Returns a new access token.',
    type: AccessTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing, invalid, expired, or revoked refresh token.',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenDto> {
    const { sub, refreshToken } = req.user as ValidatedUser;

    const tokens = await this.authService.refresh(sub, refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: SECURE_ENVIRONMENT === this.configService.get('NODE_ENV')!,
      sameSite: SAME_SITE,
      maxAge: REFRESH_TTL_SEC,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Sign out the current user',
    description:
      'Revokes all active tokens for the user, closes the current session, and clears the `refresh_token` cookie.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully signed out.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid access token.',
  })
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { id } = req.user as User;

    await this.authService.signout(id);

    res.clearCookie('refresh_token');
  }
}
