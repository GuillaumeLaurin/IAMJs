import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/features/login-form/login-form';

const MOCK_TRANSLATIONS: Record<string, string> = {
  title: 'Connexion',
  subtitle: 'Connectez-vous à votre compte',
  google: 'Google',
  github: 'GitHub',
  orByEmail: 'ou par email',
  emailLabel: 'Email',
  emailPlaceholder: 'votre@email.com',
  passwordLabel: 'Mot de passe',
  passwordPlaceholder: '••••••••',
  forgot: 'Mot de passe oublié ?',
  rememberMe: 'Se souvenir de moi',
  submit: 'Se connecter',
  loading: 'Chargement...',
  noAccount: 'Pas de compte ?',
  requestAccess: "Demander un accès",
  serverError: 'Une erreur est survenue',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
};

// NOTE: La regex du composant utilise `d` littéral au lieu de `\d`.
// Ce mot de passe contient : minuscule, majuscule, la lettre "d", un caractère spécial.
const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'Passwor1@';

const mockUseTranslations = jest.fn();
const mockFetch = jest.fn();
const mockNavigateTo = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('@/lib/navigate', () => ({
  navigateTo: (...args: unknown[]) => mockNavigateTo(...args),
}));

jest.mock('lucide-react', () => ({
  Eye: (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff: (props: Record<string, unknown>) => <span data-testid="icon-eye-off" {...props} />,
  Loader2: (props: Record<string, unknown>) => <span data-testid="icon-loader" {...props} />,
  Mail: (props: Record<string, unknown>) => <span data-testid="icon-mail" {...props} />,
  Lock: (props: Record<string, unknown>) => <span data-testid="icon-lock" {...props} />,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();
    mockFetch.mockReset();
    mockNavigateTo.mockReset();

    mockUseTranslations.mockReturnValue((key: string) => MOCK_TRANSLATIONS[key] ?? key);
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    const { container } = render(<LoginForm />);
    expect(container).toBeDefined();
  });

  describe('header', () => {
    it('should display the title', () => {
      render(<LoginForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.title)).toBeDefined();
    });

    it('should display the subtitle', () => {
      render(<LoginForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.subtitle)).toBeDefined();
    });
  });

  describe('OAuth buttons', () => {
    it('should display the Google button', () => {
      render(<LoginForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.google)).toBeDefined();
    });

    it('should display the GitHub button', () => {
      render(<LoginForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.github)).toBeDefined();
    });

    it('should navigate to Google OAuth when Google button is clicked', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.google));

      expect(mockNavigateTo).toHaveBeenCalledWith('/api/auth/google');
    });

    it('should navigate to GitHub OAuth when GitHub button is clicked', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.github));

      expect(mockNavigateTo).toHaveBeenCalledWith('/api/auth/github');
    });
  });

  describe('email field', () => {
    it('should render the email input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel)).toBeDefined();
    });

    it('should have the correct placeholder', () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText(MOCK_TRANSLATIONS.emailPlaceholder)).toBeDefined();
    });

    it('should have autocomplete set to "email"', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel).getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('password field', () => {
    it('should render the password input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel)).toBeDefined();
    });

    it('should have type "password" by default', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('password');
    });

    it('should toggle to type "text" when show password is clicked', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByLabelText(MOCK_TRANSLATIONS.showPassword));

      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('text');
    });

    it('should toggle back to type "password" when hide password is clicked', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByLabelText(MOCK_TRANSLATIONS.showPassword));
      await userEvent.click(screen.getByLabelText(MOCK_TRANSLATIONS.hidePassword));

      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('password');
    });

    it('should have autocomplete set to "current-password"', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('autocomplete')).toBe('current-password');
    });
  });

  describe('remember me', () => {
    it('should render the remember me checkbox', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.rememberMe)).toBeDefined();
    });

    it('should be unchecked by default', () => {
      render(<LoginForm />);
      expect((screen.getByLabelText(MOCK_TRANSLATIONS.rememberMe) as HTMLInputElement).checked).toBe(false);
    });

    it('should toggle when clicked', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByLabelText(MOCK_TRANSLATIONS.rememberMe));

      expect((screen.getByLabelText(MOCK_TRANSLATIONS.rememberMe) as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('links', () => {
    it('should render the forgot password link', () => {
      render(<LoginForm />);
      const link = screen.getByText(MOCK_TRANSLATIONS.forgot);
      expect(link.getAttribute('href')).toBe('/forgot-password');
    });

    it('should render the register link', () => {
      render(<LoginForm />);
      const link = screen.getByText(MOCK_TRANSLATIONS.requestAccess);
      expect(link.getAttribute('href')).toBe('/register');
    });
  });

  describe('form submission', () => {
    async function fillAndSubmit(email: string, password: string) {
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel), email);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel), password);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));
    }

    it('should call fetch with correct data on valid submission', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      render(<LoginForm />);

      await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: VALID_EMAIL,
            password: VALID_PASSWORD,
            rememberMe: false,
          }),
        });
      });
    });

    it('should navigate to /dashboard on successful login', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      render(<LoginForm />);

      await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

      await waitFor(() => {
        expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display server error message when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      render(<LoginForm />);

      await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

      expect(await screen.findByText('Invalid credentials')).toBeDefined();
    });

    it('should display default server error when response has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });
      render(<LoginForm />);

      await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

      expect(await screen.findByText(MOCK_TRANSLATIONS.serverError)).toBeDefined();
    });

    it('should display default server error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      render(<LoginForm />);

      await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

      expect(await screen.findByText(MOCK_TRANSLATIONS.serverError)).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should show password error for empty password', async () => {
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel), VALID_EMAIL);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      expect(await screen.findByText('Le mot de passe est requis')).toBeDefined();
    });

    it('should not call fetch when form is invalid', async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });
});