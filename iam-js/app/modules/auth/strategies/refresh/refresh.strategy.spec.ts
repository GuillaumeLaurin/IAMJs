import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { RefreshStrategy } from '@auth/strategies/refresh/refresh.strategy';
import { ConfigService } from '@nestjs/config';
import { createStubInstance } from 'sinon';
import type { SinonStubbedInstance } from 'sinon';
import { UnauthorizedException } from '@nestjs/common';
import type { Payload } from '@auth/interfaces/payload.interface';
import type { Request } from 'express';

const REFRESH_TOKEN = 'refresh.token.stub';

const MOCK_PAYLOAD: Payload = {
  sub: '1',
  tokenVersion: 1,
  jti: 'stub-jti-uuid',
};

describe('RefreshStrategy', () => {
  let strategy: RefreshStrategy;
  let configService: SinonStubbedInstance<ConfigService>;

  beforeEach(async () => {
    configService = createStubInstance<ConfigService>(ConfigService);
    configService.get.returns('refresh-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshStrategy, { provide: ConfigService, useValue: configService }],
    }).compile();

    strategy = module.get<RefreshStrategy>(RefreshStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the payload merged with refreshToken from cookies', () => {
      const req = {
        cookies: { refresh_token: REFRESH_TOKEN },
        body: {},
      } as unknown as Request;

      const result = strategy.validate(req, MOCK_PAYLOAD);

      expect(result).toEqual({ ...MOCK_PAYLOAD, refreshToken: REFRESH_TOKEN });
    });

    it('should return the payload merged with refreshToken from body if cookie is absent', () => {
      const req = {
        cookies: {},
        body: { refreshToken: REFRESH_TOKEN },
      } as unknown as Request;

      const result = strategy.validate(req, MOCK_PAYLOAD);

      expect(result).toEqual({ ...MOCK_PAYLOAD, refreshToken: REFRESH_TOKEN });
    });

    it('should throw UnauthorizedException if refreshToken is absent from both cookie and body', () => {
      const req = {
        cookies: {},
        body: {},
      } as unknown as Request;

      let error: unknown;
      try {
        strategy.validate(req, MOCK_PAYLOAD);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(UnauthorizedException);
    });
  });
});
