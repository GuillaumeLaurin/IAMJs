import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/[locale]/register/page';
import type { useTranslations } from 'next-intl';

type TranslationFunction = ReturnType<typeof useTranslations>;

const MOCK_REGISTER_TRANSLATIONS: Record<string, string> = {
  heroPrefix: 'Rejoignez',
  heroAccent: 'la communauté',
  heroSuffix: 'dès maintenant',
  heroDescription: 'Une description inspirante.',
  members: '+200 membres',
  featureSecurity: 'Sécurité renforcée',
  featureSpeed: 'Rapidité optimale',
  featureCollaboration: 'Collaboration simplifiée',
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
  useTranslations: (namespace: string) => mockUseTranslations(namespace) as TranslationFunction,
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('lucide-react', () => ({
  Shield: (props: Record<string, unknown>) => <span data-testid="icon-shield" {...props} />,
}));

jest.mock('@/components/features/register-form/register-form', () => ({
  __esModule: true,
  default: () => <div data-testid="register-form">RegisterForm</div>,
}));

jest.mock('@/components/ui/locale-switcher/locale-switcher', () => ({
  __esModule: true,
  default: () => (
    <button type="button" data-testid="locale-switcher">
      FR
    </button>
  ),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();

    mockUseTranslations.mockImplementation((namespace: string) => {
      const translations =
        namespace === 'register' ? MOCK_REGISTER_TRANSLATIONS : MOCK_COMMON_TRANSLATIONS;
      return (key: string) => translations[key] ?? key;
    });
  });

  it('should be defined', () => {
    const { container } = render(<RegisterPage />);
    expect(container).toBeDefined();
  });

  describe('branding panel', () => {
    it('should display the app name', () => {
      render(<RegisterPage />);
      const appNames = screen.getAllByText(MOCK_COMMON_TRANSLATIONS.appName);
      expect(appNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should display the hero prefix', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.heroPrefix, { exact: false })).toBeDefined();
    });

    it('should display the hero accent', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.heroAccent)).toBeDefined();
    });

    it('should display the hero suffix', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.heroSuffix, { exact: false })).toBeDefined();
    });

    it('should display the hero description', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.heroDescription)).toBeDefined();
    });

    it('should display the members count', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.members)).toBeDefined();
    });

    it('should display avatar initials', () => {
      render(<RegisterPage />);
      expect(screen.getByText('MD')).toBeDefined();
      expect(screen.getByText('JL')).toBeDefined();
      expect(screen.getByText('AK')).toBeDefined();
    });

    it('should display feature highlights', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.featureSecurity)).toBeDefined();
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.featureSpeed)).toBeDefined();
      expect(screen.getByText(MOCK_REGISTER_TRANSLATIONS.featureCollaboration)).toBeDefined();
    });
  });

  describe('register card', () => {
    it('should render the RegisterForm component', () => {
      render(<RegisterPage />);
      expect(screen.getByTestId('register-form')).toBeDefined();
    });

    it('should render the LocaleSwitcher component', () => {
      render(<RegisterPage />);
      expect(screen.getByTestId('locale-switcher')).toBeDefined();
    });
  });

  describe('navigation links', () => {
    it('should render home links with href "/"', () => {
      render(<RegisterPage />);
      const homeLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href') === '/');
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should render the privacy link', () => {
      render(<RegisterPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.privacy);
      expect(link.getAttribute('href')).toBe('/privacy');
    });

    it('should render the terms link', () => {
      render(<RegisterPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.terms);
      expect(link.getAttribute('href')).toBe('/terms');
    });

    it('should render the status link', () => {
      render(<RegisterPage />);
      const link = screen.getByText(MOCK_COMMON_TRANSLATIONS.status);
      expect(link.getAttribute('href')).toBe('/status');
    });
  });

  describe('security badge', () => {
    it('should display the encrypted label', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_COMMON_TRANSLATIONS.encrypted)).toBeDefined();
    });

    it('should display the security active label', () => {
      render(<RegisterPage />);
      expect(screen.getByText(MOCK_COMMON_TRANSLATIONS.securityActive)).toBeDefined();
    });

    it('should render the Shield icon', () => {
      render(<RegisterPage />);
      expect(screen.getByTestId('icon-shield')).toBeDefined();
    });
  });
});