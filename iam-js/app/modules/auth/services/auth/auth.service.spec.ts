import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { AuthService } from '@auth/services/auth/auth.service';
import { UserService } from '@app/modules/user/services/user/user.service';
import { TokenService } from '@auth/services/token/token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from '@auth/entities/session.entity';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import { UnauthorizedException } from '@nestjs/common';
import type { User } from '@app/modules/user/entities/user.entity';
import type { TokenPair } from '@auth/interfaces/token-pair.interface';
import type { OAuthProfile } from '@auth/interfaces/oauth-profile.interface';

const USER_ID = '1';
const USER_PASSWORD_PLAIN = 'password123';

const MOCK_TOKEN_PAIR: TokenPair = {
  accessToken: 'access.token.stub',
  refreshToken: 'refresh.token.stub',
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: SinonStubbedInstance<UserService>;
  let tokenService: SinonStubbedInstance<TokenService>;
  let sessionRepository: {
    create: SinonStub;
    save: SinonStub;
    findOne: SinonStub;
  };

  beforeEach(async () => {
    userService = createStubInstance<UserService>(UserService);
    tokenService = createStubInstance<TokenService>(TokenService);
    sessionRepository = {
      create: stub(),
      save: stub(),
      findOne: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: TokenService, useValue: tokenService },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should call userService.create with the given dto', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 30,
        gender: 'male',
        password: USER_PASSWORD_PLAIN,
      };
      userService.create.resolves();

      await service.signup(dto);

      expect(userService.create.calledOnceWith(dto)).toBeTruthy();
    });
  });

  describe('signin', () => {
    const dto: { email: string; password: string } = {
      email: 'john.doe@example.com',
      password: USER_PASSWORD_PLAIN,
    };

    it('should return a token pair on valid credentials', async () => {
      const { hash } = await import('argon2');
      const hashed = await hash(USER_PASSWORD_PLAIN);
      const mockUser = { id: USER_ID, password: hashed } as unknown as User;

      userService.findByEmail.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      const result = await service.signin(dto);

      expect(result).toEqual(MOCK_TOKEN_PAIR);
    });

    it('should save a new session on successful signin', async () => {
      const { hash } = await import('argon2');
      const hashed = await hash(USER_PASSWORD_PLAIN);
      const mockUser = { id: USER_ID, password: hashed } as unknown as User;

      userService.findByEmail.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      await service.signin(dto);

      expect(sessionRepository.save.calledOnce).toBeTruthy();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      userService.findByEmail.resolves(null);

      await expect(service.signin(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const { hash } = await import('argon2');
      const hashed = await hash('other-password');
      const mockUser = { id: USER_ID, password: hashed } as unknown as User;

      userService.findByEmail.resolves(mockUser);

      await expect(service.signin({ ...dto, password: 'wrong-password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should delegate to tokenService.rotateTokens and return a new token pair', async () => {
      tokenService.rotateTokens.resolves(MOCK_TOKEN_PAIR);

      const result = await service.refresh(USER_ID, MOCK_TOKEN_PAIR.refreshToken);

      expect(
        tokenService.rotateTokens.calledOnceWith(USER_ID, MOCK_TOKEN_PAIR.refreshToken),
      ).toBeTruthy();
      expect(result).toEqual(MOCK_TOKEN_PAIR);
    });
  });

  describe('oauthSignin', () => {
    const profile = {
      provider: 'google',
      providerId: 'google-id-123',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
    } as unknown as OAuthProfile;

    it('should return a token pair after finding or creating the user', async () => {
      const mockUser = { id: USER_ID } as unknown as User;
      userService.findOrCreateUser.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      const result = await service.oauthSignin(profile);

      expect(result).toEqual(MOCK_TOKEN_PAIR);
    });

    it('should call userService.findOrCreateUser with the given profile', async () => {
      const mockUser = { id: USER_ID } as unknown as User;
      userService.findOrCreateUser.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      await service.oauthSignin(profile);

      expect(userService.findOrCreateUser.calledOnceWith(profile)).toBeTruthy();
    });

    it('should save a new session after oauth signin', async () => {
      const mockUser = { id: USER_ID } as unknown as User;
      userService.findOrCreateUser.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      await service.oauthSignin(profile);

      expect(sessionRepository.save.calledOnce).toBeTruthy();
    });

    it('should call tokenService.generateTokenPair with the user id', async () => {
      const mockUser = { id: USER_ID } as unknown as User;
      userService.findOrCreateUser.resolves(mockUser);
      sessionRepository.create.returns({});
      sessionRepository.save.resolves();
      tokenService.generateTokenPair.resolves(MOCK_TOKEN_PAIR);

      await service.oauthSignin(profile);

      expect(tokenService.generateTokenPair.calledOnceWith(USER_ID)).toBeTruthy();
    });
  });

  describe('signout', () => {
    it('should update the session logoutAt and revoke all tokens', async () => {
      const mockSession = { logoutAt: null } as unknown as Session;
      sessionRepository.findOne.resolves(mockSession);
      sessionRepository.save.resolves();
      tokenService.revokeAllTokens.resolves();

      await service.signout(USER_ID);

      expect(sessionRepository.save.calledOnce).toBeTruthy();
      const savedSession = sessionRepository.save.getCall(0).args[0] as unknown as Session;
      expect(savedSession.logoutAt).not.toBeNull();
      expect(tokenService.revokeAllTokens.calledOnceWith(USER_ID)).toBeTruthy();
    });

    it('should still revoke all tokens even if no active session is found', async () => {
      sessionRepository.findOne.resolves(null);
      tokenService.revokeAllTokens.resolves();

      await service.signout(USER_ID);

      expect(sessionRepository.save.called).toBeFalsy();
      expect(tokenService.revokeAllTokens.calledOnceWith(USER_ID)).toBeTruthy();
    });
  });
});
