import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/[locale]/login/page';

const MOCK_LOGIN_TRANSLATIONS: Record<string, string> = {
  heroPrefix: 'Bienvenue sur',
  heroAccent: 'la plateforme',
  heroSuffix: 'du futur',
  heroDescription: 'Une description inspirante.',
  testimonial: 'Un super témoignage.',
  members: '+200 membres',
};

const MOCK_COMMON_TRANSLATIONS: Record<string, string> = {
  appName: 'IAMJs',
  privacy: 'Confidentialité',
  terms: 'Conditions',
  status: 'Statut',
  encrypted: 'Chiffré de bout en bout',
  securityActive: 'Sécurité active',
};

const mockUseTranslations = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => ({
  Shield: (props: Record<string, unknown>) => <span data-testid="icon-shield" {...props} />,
}));

jest.mock('@/components/features/login-form/login-form', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">LoginForm</div>,
}));

jest.mock('@/components/ui/locale-switcher/locale-switcher', () => ({
  __esModule: true,
  default: () => <button data-testid="locale-switcher">FR</button>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();

    mockUseTranslations.mockImplementation((namespace: string) => {
      const translations = namespace === 'login' ? MOCK_LOGIN_TRANSLATIONS : MOCK_COMMON_TRANSLATIONS;
      return (key: string) => translations[key] ?? key;
    });
  });

  it('should be defined', () => {
    const { container } = render(<LoginPage />);
    expect(container).toBeDefined();
  });

  describe('branding panel', () => {
    it('should display the app name', () => {
      render(<LoginPage />);
      const appNames = screen.getAllByText(MOCK_COMMON_TRANSLATIONS.appName);
      expect(appNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should display the hero prefix', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.heroPrefix, { exact: false })).toBeDefined();
    });

    it('should display the hero accent', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.heroAccent)).toBeDefined();
    });

    it('should display the hero suffix', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.heroSuffix, { exact: false })).toBeDefined();
    });

    it('should display the hero description', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.heroDescription)).toBeDefined();
    });

    it('should display the testimonial', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.testimonial)).toBeDefined();
    });

    it('should display the members count', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_LOGIN_TRANSLATIONS.members)).toBeDefined();
    });

    it('should display avatar initials', () => {
      render(<LoginPage />);
      expect(screen.getByText('MD')).toBeDefined();
      expect(screen.getByText('JL')).toBeDefined();
      expect(screen.getByText('AK')).toBeDefined();
    });
  });

  describe('login card', () => {
    it('should render the LoginForm component', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('login-form')).toBeDefined();
    });

    it('should render the LocaleSwitcher component', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('locale-switcher')).toBeDefined();
    });
  });

  describe('navigation links', () => {
    it('should render home links with href "/"', () => {
      render(<LoginPage />);
      const homeLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/');
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should render the privacy link', () => {
      render(<LoginPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.privacy);
      expect(link.getAttribute('href')).toBe('/privacy');
    });

    it('should render the terms link', () => {
      render(<LoginPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.terms);
      expect(link.getAttribute('href')).toBe('/terms');
    });

    it('should render the status link', () => {
      render(<LoginPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.status);
      expect(link.getAttribute('href')).toBe('/status');
    });
  });

  describe('security badge', () => {
    it('should display the encrypted label', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_COMMON_TRANSLATIONS.encrypted)).toBeDefined();
    });

    it('should display the security active label', () => {
      render(<LoginPage />);
      expect(screen.getByText(MOCK_COMMON_TRANSLATIONS.securityActive)).toBeDefined();
    });

    it('should render the Shield icon', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('icon-shield')).toBeDefined();
    });
  });
});