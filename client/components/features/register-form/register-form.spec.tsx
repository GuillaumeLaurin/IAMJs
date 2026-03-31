import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/features/register-form/register-form';
import MockAdapter from 'axios-mock-adapter';
import { api } from '@/lib/axios';

const mockApi = new MockAdapter(api);

const NEXT_PUBLIC_API_URL = 'http://localhost:10000/api';

const MOCK_TRANSLATIONS: Record<string, string> = {
  title: 'Créer un compte',
  subtitle: 'Rejoignez-nous dès maintenant',
  google: 'Google',
  github: 'GitHub',
  orByEmail: 'ou par email',
  firstNameLabel: 'Prénom',
  firstNamePlaceholder: 'Jean',
  lastNameLabel: 'Nom',
  lastNamePlaceholder: 'Dupont',
  ageLabel: 'Âge',
  genderLabel: 'Genre',
  genderMale: 'Homme',
  genderFemale: 'Femme',
  genderOther: 'Autre',
  emailLabel: 'Email',
  emailPlaceholder: 'votre@email.com',
  passwordLabel: 'Mot de passe',
  passwordConfirmationLabel: 'Confirmer le mot de passe',
  passwordPlaceholder: '••••••••',
  submit: "S'inscrire",
  loading: 'Chargement...',
  hasAccount: 'Déjà un compte ?',
  signIn: 'Se connecter',
  serverError: 'Une erreur est survenue',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  passwordRequired: 'Le mot de passe est requis',
};

const MOCK_VALIDATION_TRANSLATIONS: Record<string, string> = {
  firstNameRequired: 'Le prénom est requis',
  lastNameRequired: 'Le nom est requis',
  ageMin: 'Vous devez avoir au moins 18 ans',
  ageMax: 'Âge invalide',
  genderRequired: 'Le genre est requis',
  emailInvalid: 'Email invalide',
  emailRequired: "L'email est requis",
  passwordRequired: 'Le mot de passe est requis',
  passwordInvalid: 'Mot de passe invalide',
  passwordDifferent: 'Les mots de passe ne correspondent pas',
};

// NOTE: La regex du composant utilise `\d` pour les chiffres.
// Ce mot de passe contient : minuscule, majuscule, chiffre, caractère spécial.
const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'Password1@';
const VALID_FIRST_NAME = 'Jean';
const VALID_LAST_NAME = 'Dupont';

const mockUseTranslations = jest.fn();
const mockFetch = jest.fn();
const mockNavigateTo = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
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
  User: (props: Record<string, unknown>) => <span data-testid="icon-user" {...props} />,
  Calendar: (props: Record<string, unknown>) => <span data-testid="icon-calendar" {...props} />,
  Users: (props: Record<string, unknown>) => <span data-testid="icon-users" {...props} />,
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();
    mockFetch.mockReset();
    mockNavigateTo.mockReset();
    mockApi.reset();

    process.env.NEXT_PUBLIC_API_URL = NEXT_PUBLIC_API_URL;

    mockUseTranslations.mockImplementation((namespace: string) => {
      const translations =
        namespace === 'validation' ? MOCK_VALIDATION_TRANSLATIONS : MOCK_TRANSLATIONS;
      return (key: string) => translations[key] ?? key;
    });

    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    const { container } = render(<RegisterForm />);
    expect(container).toBeDefined();
  });

  describe('header', () => {
    it('should display the title', () => {
      render(<RegisterForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.title)).toBeDefined();
    });

    it('should display the subtitle', () => {
      render(<RegisterForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.subtitle)).toBeDefined();
    });
  });

  describe('OAuth buttons', () => {
    it('should display the Google button', () => {
      render(<RegisterForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.google)).toBeDefined();
    });

    it('should display the GitHub button', () => {
      render(<RegisterForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.github)).toBeDefined();
    });

    it('should navigate to Google OAuth when Google button is clicked', async () => {
      render(<RegisterForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.google));

      expect(mockNavigateTo).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
    });

    it('should navigate to GitHub OAuth when GitHub button is clicked', async () => {
      render(<RegisterForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.github));

      expect(mockNavigateTo).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/auth/github`);
    });
  });

  describe('first name field', () => {
    it('should render the first name input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel)).toBeDefined();
    });

    it('should have the correct placeholder', () => {
      render(<RegisterForm />);
      expect(screen.getByPlaceholderText(MOCK_TRANSLATIONS.firstNamePlaceholder)).toBeDefined();
    });

    it('should have autocomplete set to "given-name"', () => {
      render(<RegisterForm />);
      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel).getAttribute('autocomplete'),
      ).toBe('given-name');
    });
  });

  describe('last name field', () => {
    it('should render the last name input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel)).toBeDefined();
    });

    it('should have the correct placeholder', () => {
      render(<RegisterForm />);
      expect(screen.getByPlaceholderText(MOCK_TRANSLATIONS.lastNamePlaceholder)).toBeDefined();
    });

    it('should have autocomplete set to "family-name"', () => {
      render(<RegisterForm />);
      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel).getAttribute('autocomplete'),
      ).toBe('family-name');
    });
  });

  describe('age field', () => {
    it('should render the age input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.ageLabel)).toBeDefined();
    });

    it('should have type "number"', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.ageLabel).getAttribute('type')).toBe('number');
    });

    it('should have min set to "18"', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.ageLabel).getAttribute('min')).toBe('18');
    });

    it('should have max set to "100"', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.ageLabel).getAttribute('max')).toBe('100');
    });
  });

  describe('gender field', () => {
    it('should render the gender select', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.genderLabel)).toBeDefined();
    });

    it('should display male, female and other options', () => {
      render(<RegisterForm />);
      expect(screen.getByText(MOCK_TRANSLATIONS.genderMale)).toBeDefined();
      expect(screen.getByText(MOCK_TRANSLATIONS.genderFemale)).toBeDefined();
      expect(screen.getByText(MOCK_TRANSLATIONS.genderOther)).toBeDefined();
    });

    it('should default to "m"', () => {
      render(<RegisterForm />);
      expect((screen.getByLabelText(MOCK_TRANSLATIONS.genderLabel) as HTMLSelectElement).value).toBe('m');
    });
  });

  describe('email field', () => {
    it('should render the email input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel)).toBeDefined();
    });

    it('should have the correct placeholder', () => {
      render(<RegisterForm />);
      expect(screen.getByPlaceholderText(MOCK_TRANSLATIONS.emailPlaceholder)).toBeDefined();
    });

    it('should have autocomplete set to "email"', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel).getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('password field', () => {
    it('should render the password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel)).toBeDefined();
    });

    it('should have type "password" by default', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('password');
    });

    it('should toggle to type "text" when show password is clicked', async () => {
      render(<RegisterForm />);
      const [showBtn] = screen.getAllByLabelText(MOCK_TRANSLATIONS.showPassword);
      await userEvent.click(showBtn);

      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('text');
    });

    it('should toggle back to type "password" when hide password is clicked', async () => {
      render(<RegisterForm />);
      const [showBtn] = screen.getAllByLabelText(MOCK_TRANSLATIONS.showPassword);
      await userEvent.click(showBtn);

      const [hideBtn] = screen.getAllByLabelText(MOCK_TRANSLATIONS.hidePassword);
      await userEvent.click(hideBtn);

      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('type')).toBe('password');
    });

    it('should have autocomplete set to "new-password"', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel).getAttribute('autocomplete')).toBe('new-password');
    });
  });

  describe('confirm password field', () => {
    it('should render the confirm password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel)).toBeDefined();
    });

    it('should have type "password" by default', () => {
      render(<RegisterForm />);
      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel).getAttribute('type'),
      ).toBe('password');
    });

    it('should toggle to type "text" when show password is clicked', async () => {
      render(<RegisterForm />);
      const showBtns = screen.getAllByLabelText(MOCK_TRANSLATIONS.showPassword);
      await userEvent.click(showBtns[1]);

      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel).getAttribute('type'),
      ).toBe('text');
    });

    it('should toggle back to type "password" when hide password is clicked', async () => {
      render(<RegisterForm />);
      const showBtns = screen.getAllByLabelText(MOCK_TRANSLATIONS.showPassword);
      await userEvent.click(showBtns[1]);

      const hideBtns = screen.getAllByLabelText(MOCK_TRANSLATIONS.hidePassword);
      await userEvent.click(hideBtns[0]);

      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel).getAttribute('type'),
      ).toBe('password');
    });

    it('should have autocomplete set to "new-password"', () => {
      render(<RegisterForm />);
      expect(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel).getAttribute('autocomplete'),
      ).toBe('new-password');
    });
  });

  describe('links', () => {
    it('should render the sign in link', () => {
      render(<RegisterForm />);
      const link = screen.getByText(MOCK_TRANSLATIONS.signIn);
      expect(link.getAttribute('href')).toBe('/login');
    });
  });

  describe('form submission', () => {
    async function fillAndSubmit(
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) {
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel), firstName);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel), lastName);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel), email);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel), password);
      await userEvent.type(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel),
        confirmPassword,
      );
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));
    }

    it('should call api with correct data on valid submission', async () => {
      mockApi.onPost('/auth/signup').reply(200); // 👈
      render(<RegisterForm />);

      await fillAndSubmit(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_EMAIL, VALID_PASSWORD, VALID_PASSWORD);

      await waitFor(() => {
        expect(mockApi.history.post[0].url).toBe('/auth/signup');
        expect(JSON.parse(mockApi.history.post[0].data)).toEqual({
          firstName: VALID_FIRST_NAME,
          lastName: VALID_LAST_NAME,
          email: VALID_EMAIL,
          age: 18,
          gender: 'm',
          password: VALID_PASSWORD,
        });
      });
    });

    it('should navigate to /login on successful registration', async () => {
      mockApi.onPost('/auth/signup').reply(200);
      render(<RegisterForm />);

      await fillAndSubmit(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_EMAIL, VALID_PASSWORD, VALID_PASSWORD);

      await waitFor(() => {
        expect(mockNavigateTo).toHaveBeenCalledWith('/login'); // 👈
      });
    });

    it('should display server error message when response is not ok', async () => {
      mockApi.onPost('/auth/signup').reply(409, { message: 'Email already exists' });
      render(<RegisterForm />);

      await fillAndSubmit(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_EMAIL, VALID_PASSWORD, VALID_PASSWORD);

      expect(await screen.findByText('Email already exists')).toBeDefined();
    });

    it('should display default server error when response has no message', async () => {
      mockApi.onPost('/auth/signup').reply(409, {});
      render(<RegisterForm />);

      await fillAndSubmit(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_EMAIL, VALID_PASSWORD, VALID_PASSWORD);

      expect(await screen.findByText(MOCK_TRANSLATIONS.serverError)).toBeDefined();
    });

    it('should display default server error on network failure', async () => {
      mockApi.onPost('/auth/signup').networkError();
      render(<RegisterForm />);

      await fillAndSubmit(VALID_FIRST_NAME, VALID_LAST_NAME, VALID_EMAIL, VALID_PASSWORD, VALID_PASSWORD);

      expect(await screen.findByText(MOCK_TRANSLATIONS.serverError)).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should not call fetch when form is invalid', async () => {
      render(<RegisterForm />);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      expect(mockApi.history.post.length).toBe(0);
    });

    it('should show first name error when first name is too short', async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel), 'A');
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      expect(await screen.findByText(MOCK_VALIDATION_TRANSLATIONS.firstNameRequired)).toBeDefined();
    });

    it('should show last name error when last name is too short', async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel), 'A');
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      expect(await screen.findByText(MOCK_VALIDATION_TRANSLATIONS.lastNameRequired)).toBeDefined();
    });

    it('should show password error for empty password', async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel), VALID_FIRST_NAME);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel), VALID_LAST_NAME);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel), VALID_EMAIL);
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      const errors = await screen.findAllByText(MOCK_VALIDATION_TRANSLATIONS.passwordRequired);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('should show password mismatch error when passwords differ', async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.firstNameLabel), VALID_FIRST_NAME);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.lastNameLabel), VALID_LAST_NAME);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.emailLabel), VALID_EMAIL);
      await userEvent.type(screen.getByLabelText(MOCK_TRANSLATIONS.passwordLabel), VALID_PASSWORD);
      await userEvent.type(
        screen.getByLabelText(MOCK_TRANSLATIONS.passwordConfirmationLabel),
        'DifferentPassword1@',
      );
      await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.submit));

      expect(await screen.findByText(MOCK_VALIDATION_TRANSLATIONS.passwordDifferent)).toBeDefined();
    });
  });
});