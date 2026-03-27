import type { Server } from 'http';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from '@auth/controllers/auth/auth.controller';
import { AuthService } from '@auth/services/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RefreshGuard } from '@auth/guards/refresh.guard';
import { GoogleGuard } from '@auth/guards/google.guard';
import { GithubGuard } from '@auth/guards/github.guard';
import { AccessStrategy } from '@auth/strategies/access/access.strategy';
import { RefreshStrategy } from '@auth/strategies/refresh/refresh.strategy';
import { UserService } from '@app/modules/user/services/user/user.service';
import { TokenService } from '@auth/services/token/token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import type { SignUpDto } from '@auth/dto/signup.dto';
import type { SignInDto } from '@auth/dto/signin.dto';
import type { User } from '@app/modules/user/entities/user.entity';
import type { TokenPair } from '@auth/interfaces/token-pair.interface';

const USER_ID = '1';
const TOKEN_VERSION = 1;
const JTI = 'stub-jti-uuid';
const ACCESS_SECRET = 'access-secret-test';
const REFRESH_SECRET = 'refresh-secret-test';

const MOCK_USER = {
  id: USER_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  tokenVersion: TOKEN_VERSION,
  roles: [],
} as unknown as User;

const MOCK_TOKEN_PAIR: TokenPair = {
  accessToken: 'new.access.token',
  refreshToken: 'new.refresh.token',
};

// Mock OAuth guards — bypass the real OAuth redirect flow and inject req.user directly
class MockGoogleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: TokenPair }>();
    req.user = MOCK_TOKEN_PAIR;
    return true;
  }
}

class MockGithubGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: TokenPair }>();
    req.user = MOCK_TOKEN_PAIR;
    return true;
  }
}

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let authService: SinonStubbedInstance<AuthService>;
  let userService: SinonStubbedInstance<UserService>;
  let tokenService: SinonStubbedInstance<TokenService>;
  let configServiceGet: SinonStub;
  let configServiceGetOrThrow: SinonStub;
  let jwtService: JwtService;

  beforeEach(async () => {
    authService = createStubInstance<AuthService>(AuthService);
    userService = createStubInstance<UserService>(UserService);
    tokenService = createStubInstance<TokenService>(TokenService);

    configServiceGet = stub();
    configServiceGetOrThrow = stub();

    configServiceGet.withArgs('NODE_ENV').returns('development');
    configServiceGet.withArgs('JWT_REFRESH_TOKEN').returns(REFRESH_SECRET);
    configServiceGet.withArgs('JWT_ACCESS_TOKEN').returns(ACCESS_SECRET);
    configServiceGetOrThrow.withArgs('JWT_ACCESS_TOKEN').returns(ACCESS_SECRET);
    configServiceGetOrThrow.withArgs('JWT_REFRESH_TOKEN').returns(REFRESH_SECRET);

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [AuthController],
      providers: [
        AuthGuard,
        RefreshGuard,
        AccessStrategy,
        RefreshStrategy,
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
        { provide: TokenService, useValue: tokenService },
        {
          provide: ConfigService,
          useValue: { get: configServiceGet, getOrThrow: configServiceGetOrThrow },
        },
      ],
    })
      .overrideGuard(GoogleGuard)
      .useClass(MockGoogleGuard)
      .overrideGuard(GithubGuard)
      .useClass(MockGithubGuard)
      .compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();
    httpServer = app.getHttpServer() as Server;

    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  const signAccessToken = (
    overrides: Partial<{ sub: string; tokenVersion: number; jti: string }> = {},
  ): string =>
    jwtService.sign(
      { sub: USER_ID, tokenVersion: TOKEN_VERSION, jti: JTI, ...overrides },
      { secret: ACCESS_SECRET, expiresIn: '15m' },
    );

  const signRefreshToken = (
    overrides: Partial<{ sub: string; tokenVersion: number; jti: string }> = {},
  ): string =>
    jwtService.sign(
      { sub: USER_ID, tokenVersion: TOKEN_VERSION, jti: JTI, ...overrides },
      { secret: REFRESH_SECRET, expiresIn: '7d' },
    );

  describe('POST /auth/signup', () => {
    const dto: SignUpDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      age: 30,
      gender: 'male',
      password: 'password123',
    };

    it('should return 200 and call authService.signup', async () => {
      authService.signup.resolves();

      await request(httpServer).post('/auth/signup').send(dto).expect(200);

      expect(authService.signup.calledOnce).toBeTruthy();
    });
  });

  describe('POST /auth/signin', () => {
    const dto: SignInDto = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should return 200 and the access token', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);

      const res = await request(httpServer).post('/auth/signin').send(dto).expect(200);

      expect(res.body).toEqual({ accessToken: MOCK_TOKEN_PAIR.accessToken });
    });

    it('should set the refresh_token cookie', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);

      const res = await request(httpServer).post('/auth/signin').send(dto).expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBeTruthy();
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should return 200 and the access token', async () => {
      configServiceGet.withArgs('NODE_ENV').returns('development');

      const res = await request(httpServer).get('/auth/google/callback').expect(200);

      expect(res.body).toEqual({ accessToken: MOCK_TOKEN_PAIR.accessToken });
    });

    it('should set the refresh_token cookie', async () => {
      configServiceGet.withArgs('NODE_ENV').returns('development');

      const res = await request(httpServer).get('/auth/google/callback').expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBeTruthy();
    });
  });

  describe('GET /auth/github/callback', () => {
    it('should return 200 and the access token', async () => {
      configServiceGet.withArgs('NODE_ENV').returns('development');

      const res = await request(httpServer).get('/auth/github/callback').expect(200);

      expect(res.body).toEqual({ accessToken: MOCK_TOKEN_PAIR.accessToken });
    });

    it('should set the refresh_token cookie', async () => {
      configServiceGet.withArgs('NODE_ENV').returns('development');

      const res = await request(httpServer).get('/auth/github/callback').expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBeTruthy();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 200 and a new access token with a valid refresh token cookie', async () => {
      const refreshToken = signRefreshToken();
      authService.refresh.resolves(MOCK_TOKEN_PAIR);

      const res = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(200);

      expect(res.body).toEqual({ accessToken: MOCK_TOKEN_PAIR.accessToken });
    });

    it('should set a new refresh_token cookie after rotation', async () => {
      const refreshToken = signRefreshToken();
      authService.refresh.resolves(MOCK_TOKEN_PAIR);

      const res = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${refreshToken}`)
        .expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBeTruthy();
    });

    it('should return 401 with no refresh token', async () => {
      await request(httpServer).post('/auth/refresh').expect(401);
    });

    it('should return 401 with an invalid refresh token', async () => {
      await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=invalid.token.here')
        .expect(401);
    });
  });

  describe('POST /auth/signout', () => {
    it('should return 204 and call authService.signout with a valid access token', async () => {
      const accessToken = signAccessToken();
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.resolves(MOCK_USER);
      authService.signout.resolves();

      await request(httpServer)
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      expect(authService.signout.calledOnceWith(USER_ID)).toBeTruthy();
    });

    it('should clear the refresh_token cookie on signout', async () => {
      const accessToken = signAccessToken();
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.resolves(MOCK_USER);
      authService.signout.resolves();

      const res = await request(httpServer)
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes('refresh_token=;'))).toBeTruthy();
    });

    it('should return 401 with no access token', async () => {
      await request(httpServer).post('/auth/signout').expect(401);
    });

    it('should return 401 if the access token is blacklisted', async () => {
      const accessToken = signAccessToken();
      tokenService.isAccessTokenBlacklisted.resolves(true);

      await request(httpServer)
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should return 401 if the tokenVersion does not match', async () => {
      const accessToken = signAccessToken({ tokenVersion: 0 });
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.resolves(MOCK_USER);

      await request(httpServer)
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
