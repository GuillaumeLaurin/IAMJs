import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { AuthController } from '@auth/controllers/auth/auth.controller';
import { AuthService } from '@auth/services/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import type { SignUpDto } from '@auth/dto/signup.dto';
import type { SignInDto } from '@auth/dto/signin.dto';
import type { ValidatedUser } from '@auth/strategies/refresh/refresh.strategy';
import type { User } from '@app/modules/user/entities/user.entity';
import type { Response, Request } from 'express';
import type { TokenPair } from '@auth/interfaces/token-pair.interface';

const USER_ID = '1';
const ACCESS_TOKEN = 'access.token.stub';
const REFRESH_TOKEN = 'refresh.token.stub';

const MOCK_TOKEN_PAIR: TokenPair = {
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: SinonStubbedInstance<AuthService>;
  let configService: SinonStubbedInstance<ConfigService>;
  let res: { cookie: SinonStub; clearCookie: SinonStub };

  beforeEach(async () => {
    authService = createStubInstance<AuthService>(AuthService);
    configService = createStubInstance<ConfigService>(ConfigService);

    res = {
      cookie: stub(),
      clearCookie: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup with the given dto', async () => {
      const dto: SignUpDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 30,
        gender: 'male',
        password: 'password123',
      };
      authService.signup.resolves();

      await controller.signup(dto);

      expect(authService.signup.calledOnceWith(dto)).toBeTruthy();
    });
  });

  describe('signin', () => {
    const dto: SignInDto = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should return the access token', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');

      const result = await controller.signin(dto, res as unknown as Response);

      expect(result).toEqual({ accessToken: ACCESS_TOKEN });
    });

    it('should set the refresh_token cookie with the refresh token', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');

      await controller.signin(dto, res as unknown as Response);

      expect(res.cookie.calledOnce).toBeTruthy();
      const [cookieName, cookieValue] = res.cookie.getCall(0).args as [string, string];
      expect(cookieName).toEqual('refresh_token');
      expect(cookieValue).toEqual(REFRESH_TOKEN);
    });

    it('should set secure cookie flag when in production', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('production');

      await controller.signin(dto, res as unknown as Response);

      const [, , options] = res.cookie.getCall(0).args as [string, string, { secure: boolean }];
      expect(options.secure).toBe(true);
    });

    it('should not set secure cookie flag outside of production', async () => {
      authService.signin.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');

      await controller.signin(dto, res as unknown as Response);

      const [, , options] = res.cookie.getCall(0).args as [string, string, { secure: boolean }];
      expect(options.secure).toBe(false);
    });
  });

  describe('refresh', () => {
    const validatedUser: ValidatedUser = {
      sub: USER_ID,
      tokenVersion: 1,
      jti: 'stub-jti-uuid',
      refreshToken: REFRESH_TOKEN,
    };

    it('should return a new access token', async () => {
      authService.refresh.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');
      const req = { user: validatedUser } as unknown as Request;

      const result = await controller.refresh(req, res as unknown as Response);

      expect(result).toEqual({ accessToken: ACCESS_TOKEN });
    });

    it('should call authService.refresh with userId and refreshToken from the validated user', async () => {
      authService.refresh.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');
      const req = { user: validatedUser } as unknown as Request;

      await controller.refresh(req, res as unknown as Response);

      expect(authService.refresh.calledOnceWith(USER_ID, REFRESH_TOKEN)).toBeTruthy();
    });

    it('should set a new refresh_token cookie', async () => {
      authService.refresh.resolves(MOCK_TOKEN_PAIR);
      configService.get.returns('development');
      const req = { user: validatedUser } as unknown as Request;

      await controller.refresh(req, res as unknown as Response);

      expect(res.cookie.calledOnce).toBeTruthy();
      const [cookieName, cookieValue] = res.cookie.getCall(0).args as [string, string];
      expect(cookieName).toEqual('refresh_token');
      expect(cookieValue).toEqual(REFRESH_TOKEN);
    });
  });

  describe('signout', () => {
    it('should call authService.signout with the user id', async () => {
      authService.signout.resolves();
      const req = { user: { id: USER_ID } as unknown as User } as unknown as Request;

      await controller.signout(req, res as unknown as Response);

      expect(authService.signout.calledOnceWith(USER_ID)).toBeTruthy();
    });

    it('should clear the refresh_token cookie', async () => {
      authService.signout.resolves();
      const req = { user: { id: USER_ID } as unknown as User } as unknown as Request;

      await controller.signout(req, res as unknown as Response);

      expect(res.clearCookie.calledOnceWith('refresh_token')).toBeTruthy();
    });
  });
});