import { render, screen } from '@testing-library/react';
import AuthCallbackPage from '@/app/[locale]/auth/callback/page';
import type { useTranslations } from 'next-intl';
import type { useRouter } from '@/i18n/navigation';

type TranslationFunction = ReturnType<typeof useTranslations>;
type RouterFunction = ReturnType<typeof useRouter>;

const MOCK_TRANSLATIONS: Record<string, string> = {
  noToken: 'Token manquant',
  redirecting: 'Redirection en cours...',
  loading: 'Authentification en cours...',
};

const mockReplace = jest.fn();
const mockUseTranslations = jest.fn();
const mockUseRouter = jest.fn();
const mockUseSearchParams = jest.fn();
const mockSetItem = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations() as TranslationFunction,
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams() as TranslationFunction,
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => mockUseRouter() as RouterFunction,
}));

jest.mock('lucide-react', () => ({
  Loader2: (props: Record<string, unknown>) => <span data-testid="icon-loader" {...props} />,
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseTranslations.mockReset();
    mockUseRouter.mockReset();
    mockUseSearchParams.mockReset();
    mockSetItem.mockReset();

    jest.useFakeTimers();

    mockUseTranslations.mockReturnValue((key: string) => MOCK_TRANSLATIONS[key] ?? key);
    mockUseRouter.mockReturnValue({ replace: mockReplace });

    Object.defineProperty(window, 'localStorage', {
      value: { setItem: mockSetItem },
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('when accessToken is present', () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('accessToken=abc123'));
    });

    it('should be defined', () => {
      const { container } = render(<AuthCallbackPage />);
      expect(container).toBeDefined();
    });

    it('should store the accessToken in localStorage', () => {
      render(<AuthCallbackPage />);
      expect(mockSetItem).toHaveBeenCalledWith('accessToken', 'abc123');
    });

    it('should redirect to /dashboard', () => {
      render(<AuthCallbackPage />);
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });

    it('should display the loading message', () => {
      render(<AuthCallbackPage />);
      expect(screen.getByText(MOCK_TRANSLATIONS.loading)).toBeDefined();
    });

    it('should render the Loader2 icon', () => {
      render(<AuthCallbackPage />);
      expect(screen.getByTestId('icon-loader')).toBeDefined();
    });

    it('should not display the error message', () => {
      render(<AuthCallbackPage />);
      expect(screen.queryByText(MOCK_TRANSLATIONS.noToken)).toBeNull();
    });
  });

  describe('when accessToken is missing', () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    });

    it('should display the error message', () => {
      render(<AuthCallbackPage />);
      expect(screen.getByText(MOCK_TRANSLATIONS.noToken)).toBeDefined();
    });

    it('should display the redirecting message', () => {
      render(<AuthCallbackPage />);
      expect(screen.getByText(MOCK_TRANSLATIONS.redirecting)).toBeDefined();
    });

    it('should not display the loading message', () => {
      render(<AuthCallbackPage />);
      expect(screen.queryByText(MOCK_TRANSLATIONS.loading)).toBeNull();
    });

    it('should not store anything in localStorage', () => {
      render(<AuthCallbackPage />);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    it('should not redirect to /dashboard', () => {
      render(<AuthCallbackPage />);
      expect(mockReplace).not.toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to /login after 3 seconds', () => {
      render(<AuthCallbackPage />);
      expect(mockReplace).not.toHaveBeenCalledWith('/login');

      jest.advanceTimersByTime(3000);

      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    it('should not redirect to /login before 3 seconds', () => {
      render(<AuthCallbackPage />);

      jest.advanceTimersByTime(2999);

      expect(mockReplace).not.toHaveBeenCalledWith('/login');
    });
  });
});
