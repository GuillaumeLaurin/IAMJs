import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { AccessStrategy } from '@auth/strategies/access/access.strategy';
import { UserService } from '@app/modules/user/services/user/user.service';
import { TokenService } from '@auth/services/token/token.service';
import { ConfigService } from '@nestjs/config';
import { createStubInstance } from 'sinon';
import type { SinonStubbedInstance } from 'sinon';
import { UnauthorizedException } from '@nestjs/common';
import type { User } from '@app/modules/user/entities/user.entity';
import type { Payload } from '@auth/interfaces/payload.interface';

const USER_ID = '1';
const JTI = 'stub-jti-uuid';

const MOCK_USER = {
  id: USER_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  tokenVersion: 1,
  roles: [],
} as unknown as User;

const MOCK_PAYLOAD: Payload = {
  sub: USER_ID,
  tokenVersion: 1,
  jti: JTI,
};

describe('AccessStrategy', () => {
  let strategy: AccessStrategy;
  let userService: SinonStubbedInstance<UserService>;
  let tokenService: SinonStubbedInstance<TokenService>;
  let configService: SinonStubbedInstance<ConfigService>;

  beforeEach(async () => {
    userService = createStubInstance<UserService>(UserService);
    tokenService = createStubInstance<TokenService>(TokenService);
    configService = createStubInstance<ConfigService>(ConfigService);
    configService.get.returns('access-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessStrategy,
        { provide: UserService, useValue: userService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<AccessStrategy>(AccessStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user when token is valid and session is active', async () => {
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.resolves(MOCK_USER);

      const result = await strategy.validate(MOCK_PAYLOAD);

      expect(result).toEqual(MOCK_USER);
    });

    it('should throw UnauthorizedException if token is blacklisted', async () => {
      tokenService.isAccessTokenBlacklisted.resolves(true);

      await expect(strategy.validate(MOCK_PAYLOAD)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.rejects(new UnauthorizedException());

      await expect(strategy.validate(MOCK_PAYLOAD)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if tokenVersion does not match', async () => {
      const stalePayload: Payload = { ...MOCK_PAYLOAD, tokenVersion: 0 };
      tokenService.isAccessTokenBlacklisted.resolves(false);
      userService.findOne.resolves(MOCK_USER);

      await expect(strategy.validate(stalePayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
