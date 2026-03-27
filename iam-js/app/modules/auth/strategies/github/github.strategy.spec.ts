import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { GithubStrategy } from '@auth/strategies/github/github.strategy';
import { AuthService } from '@auth/services/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { createStubInstance, stub } from 'sinon';
import type { SinonStubbedInstance, SinonStub } from 'sinon';
import type { Profile } from 'passport-github2';
import type { TokenPair } from '@auth/interfaces/token-pair.interface';

const MOCK_TOKEN_PAIR: TokenPair = {
  accessToken: 'access.token.stub',
  refreshToken: 'refresh.token.stub',
};

const buildProfile = (overrides: Partial<Profile> = {}): Profile =>
  ({
    id: 'github-id-123',
    provider: 'github',
    displayName: 'John Doe',
    username: 'johndoe',
    emails: [{ value: 'john.doe@example.com' }],
    photos: [],
    ...overrides,
  }) as unknown as Profile;

describe('GithubStrategy', () => {
  let strategy: GithubStrategy;
  let authService: SinonStubbedInstance<AuthService>;
  let configServiceGetOrThrow: SinonStub;

  beforeEach(async () => {
    authService = createStubInstance<AuthService>(AuthService);
    configServiceGetOrThrow = stub();

    configServiceGetOrThrow.withArgs('GITHUB_CLIENT_ID').returns('stub-client-id');
    configServiceGetOrThrow.withArgs('GITHUB_CLIENT_SECRET').returns('stub-client-secret');
    configServiceGetOrThrow.withArgs('GITHUB_CALLBACK_URL').returns('http://localhost/auth/github/callback');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubStrategy,
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: configServiceGetOrThrow },
        },
      ],
    }).compile();

    strategy = module.get<GithubStrategy>(GithubStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call done with the token pair returned by oauthSignin', async () => {
      const profile = buildProfile();
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(done.calledOnceWith(null, MOCK_TOKEN_PAIR)).toBeTruthy();
    });

    it('should call oauthSignin with the correct oauth profile built from the github profile', async () => {
      const profile = buildProfile();
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(
        authService.oauthSignin.calledOnceWith({
          provider: 'github',
          providerId: 'github-id-123',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).toBeTruthy();
    });

    it('should use a fallback email based on username if no email is provided', async () => {
      const profile = buildProfile({ emails: [] });
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.email).toEqual('johndoe@github.noemail');
    });

    it('should use a fallback email based on profile id if username is also absent', async () => {
      const profile = buildProfile({ emails: [], username: undefined });
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.email).toEqual('github-id-123@github.noemail');
    });

    it('should use "Github" as lastName if displayName is a single word', async () => {
      const profile = buildProfile({ displayName: 'John' });
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.firstName).toEqual('John');
      expect(calledWith.lastName).toEqual('Github');
    });

    it('should use username as displayName if displayName is absent', async () => {
      const profile = buildProfile({ displayName: undefined });
      const done = stub();
      authService.oauthSignin.resolves(MOCK_TOKEN_PAIR);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      const calledWith = authService.oauthSignin.getCall(0).args[0];
      expect(calledWith.firstName).toEqual('johndoe');
      expect(calledWith.lastName).toEqual('Github');
    });
  });
});