import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { TokenService } from '@auth/services/token/token.service';
import { UserService } from '@app/modules/user/services/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '@app/modules/redis/redis.module';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { User } from '@app/modules/user/entities/user.entity';

const USER_ID = '1';
const ACCESS_TOKEN = 'access.token.stub';
const REFRESH_TOKEN = 'refresh.token.stub';
const JTI = 'stub-jti-uuid';

const MOCK_USER = {
  id: USER_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  tokenVersion: 1,
  roles: [],
} as unknown as User;

describe('TokenService', () => {
  let service: TokenService;
  let userService: SinonStubbedInstance<UserService>;
  let jwtService: SinonStubbedInstance<JwtService>;
  let configService: SinonStubbedInstance<ConfigService>;
  let redis: {
    get: SinonStub;
    set: SinonStub;
    del: SinonStub;
    exists: SinonStub;
  };

  beforeEach(async () => {
    userService = createStubInstance<UserService>(UserService);
    jwtService = createStubInstance<JwtService>(JwtService);
    configService = createStubInstance<ConfigService>(ConfigService);
    redis = {
      get: stub(),
      set: stub(),
      del: stub(),
      exists: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokenPair', () => {
    beforeEach(() => {
      userService.findOne.resolves(MOCK_USER);
      jwtService.signAsync
        .onFirstCall()
        .resolves(ACCESS_TOKEN)
        .onSecondCall()
        .resolves(REFRESH_TOKEN);
      configService.getOrThrow.returns('secret');
      redis.set.resolves('OK');
    });

    it('should return an access token and a refresh token', async () => {
      const result = await service.generateTokenPair(USER_ID);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toEqual(ACCESS_TOKEN);
      expect(result.refreshToken).toEqual(REFRESH_TOKEN);
    });

    it('should call userService.findOne with the given userId', async () => {
      await service.generateTokenPair(USER_ID);

      expect(userService.findOne.calledOnceWith(USER_ID)).toBeTruthy();
    });

    it('should store the hashed refresh token in Redis', async () => {
      await service.generateTokenPair(USER_ID);

      expect(redis.set.calledOnce).toBeTruthy();
      const [key, value, , ttl] = redis.set.getCall(0).args as [string, string, string, number];
      expect(key).toEqual(`refresh:${USER_ID}`);
      expect(typeof value).toEqual('string');
      expect(ttl).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userService.findOne.rejects(new NotFoundException());

      await expect(service.generateTokenPair(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rotateTokens', () => {
    it('should revoke all tokens and throw UnauthorizedException if refresh token hash does not match', async () => {
      // Use a real hash of a *different* token so verify() returns false
      const { hash } = await import('argon2');
      const storedHash = await hash('other-token');
      redis.get.resolves(storedHash);
      redis.del.resolves(1);
      userService.incremetTokenVersion.resolves();

      await expect(service.rotateTokens(USER_ID, 'incoming-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(redis.del.calledWith(`refresh:${USER_ID}`)).toBeTruthy();
      expect(userService.incremetTokenVersion.calledWith(USER_ID)).toBeTruthy();
    });

    it('should throw UnauthorizedException if no refresh token is stored in Redis', async () => {
      redis.get.resolves(null);

      await expect(service.rotateTokens(USER_ID, REFRESH_TOKEN)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should delete the old refresh token and generate a new token pair on valid rotation', async () => {
      const { hash } = await import('argon2');
      const storedHash = await hash(REFRESH_TOKEN);
      redis.get.resolves(storedHash);
      redis.del.resolves(1);
      redis.set.resolves('OK');

      userService.findOne.resolves(MOCK_USER);
      configService.getOrThrow.returns('secret');
      jwtService.signAsync
        .onFirstCall()
        .resolves(ACCESS_TOKEN)
        .onSecondCall()
        .resolves(REFRESH_TOKEN);

      const result = await service.rotateTokens(USER_ID, REFRESH_TOKEN);

      expect(redis.del.calledWith(`refresh:${USER_ID}`)).toBeTruthy();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('blacklistAccessToken', () => {
    it('should store the jti in the blacklist with the remaining TTL', async () => {
      redis.set.resolves('OK');
      const futureExp = Math.floor(Date.now() / 1000) + 900;

      await service.blacklistAccessToken(JTI, futureExp);

      expect(redis.set.calledOnce).toBeTruthy();
      const [key, value, , ttl] = redis.set.getCall(0).args as [string, string, string, number];
      expect(key).toEqual(`blacklist:${JTI}`);
      expect(value).toEqual('1');
      expect(ttl).toBeGreaterThan(0);
    });

    it('should not store anything if the token is already expired', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 10;

      await service.blacklistAccessToken(JTI, pastExp);

      expect(redis.set.called).toBeFalsy();
    });
  });

  describe('isAccessTokenBlacklisted', () => {
    it('should return true if the jti exists in the blacklist', async () => {
      redis.exists.resolves(1);

      const result = await service.isAccessTokenBlacklisted(JTI);

      expect(redis.exists.calledOnceWith(`blacklist:${JTI}`)).toBeTruthy();
      expect(result).toBe(true);
    });

    it('should return false if the jti does not exist in the blacklist', async () => {
      redis.exists.resolves(0);

      const result = await service.isAccessTokenBlacklisted(JTI);

      expect(result).toBe(false);
    });
  });

  describe('revokeAllTokens', () => {
    it('should delete the refresh token from Redis and increment the token version', async () => {
      redis.del.resolves(1);
      userService.incremetTokenVersion.resolves();

      await service.revokeAllTokens(USER_ID);

      expect(redis.del.calledWith(`refresh:${USER_ID}`)).toBeTruthy();
      expect(userService.incremetTokenVersion.calledWith(USER_ID)).toBeTruthy();
    });
  });

  describe('verifyAccessToken', () => {
    it('should call jwtService.verifyAsync with the access token secret', async () => {
      const payload = { sub: USER_ID, tokenVersion: 1, jti: JTI };
      jwtService.verifyAsync.resolves(payload);
      configService.getOrThrow.returns('access-secret');

      const result = await service.verifyAccessToken(ACCESS_TOKEN);

      expect(
        jwtService.verifyAsync.calledOnceWith(ACCESS_TOKEN, { secret: 'access-secret' }),
      ).toBeTruthy();
      expect(result).toEqual(payload);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should call jwtService.verifyAsync with the refresh token secret', async () => {
      const payload = { sub: USER_ID, tokenVersion: 1, jti: JTI };
      jwtService.verifyAsync.resolves(payload);
      configService.getOrThrow.returns('refresh-secret');

      const result = await service.verifyRefreshToken(REFRESH_TOKEN);

      expect(
        jwtService.verifyAsync.calledOnceWith(REFRESH_TOKEN, { secret: 'refresh-secret' }),
      ).toBeTruthy();
      expect(result).toEqual(payload);
    });
  });
});
