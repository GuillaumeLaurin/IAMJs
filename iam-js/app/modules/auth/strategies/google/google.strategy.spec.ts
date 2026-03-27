import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from '@auth/strategies/google/google.strategy';
import { AuthService } from '@auth/services/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import type { TokenPair } from '@auth/interfaces/token-pair.interface';

type GoogleProfile = {
  id: string;
  emails: Array<{ value: string }>;
  name: { givenName: string; familyName: string };
};

const MOCK_TOKEN_PAIR: TokenPair = {
  accessToken: 'access.token.stub',
  refreshToken: 'refresh.token.stub',
};

const MOCK_PROFILE: GoogleProfile = {
  id: 'google-id-123',
  emails: [{ value: 'john.doe@example.com' }],
  name: { givenName: 'John', familyName: 'Doe' },
};

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: SinonStubbedInstance<AuthService>;
  let configServiceGetOrThrow: SinonStub;

  beforeEach(async () => {
    authService = createStubInstance<AuthService>(AuthService);
    configServiceGetOrThrow = stub();

    configServiceGetOrThrow.withArgs('GOOGLE_CLIENT_ID').returns('stub-client-id');
    configServiceGetOrThrow.withArgs('GOOGLE_CLIENT_SECRET').returns('stub-client-secret');
    configServiceGetOrThrow
      .withArgs('GOOGLE_CALLBACK_URL')
      .returns('http://localhost/auth/google/callback');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: configServiceGetOrThrow },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call done with the token pair returned by oauthSignin', async () => {
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', MOCK_PROFILE, done);

      expect(done.calledOnceWith(null, MOCK_TOKEN_PAIR)).toBeTruthy();
    });

    it('should call oauthSignin with the correct oauth profile built from the google profile', async () => {
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', MOCK_PROFILE, done);

      expect(
        authService.oauthSignin.calledOnceWith({
          provider: 'google',
          providerId: 'google-id-123',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).toBeTruthy();
    });

    it('should use the first email from the profile emails array', async () => {
      const done = stub();
      const profile: GoogleProfile = {
        ...MOCK_PROFILE,
        emails: [{ value: 'first@example.com' }, { value: 'second@example.com' }],
      };
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.email).toEqual('first@example.com');
    });

    it('should use givenName as firstName and familyName as lastName', async () => {
      const done = stub();
      const profile: GoogleProfile = {
        ...MOCK_PROFILE,
        name: { givenName: 'Jane', familyName: 'Smith' },
      };
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.firstName).toEqual('Jane');
      expect(calledWith.lastName).toEqual('Smith');
    });
  });
});
