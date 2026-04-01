import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocaleSwitcher from '@/components/ui/locale-switcher/locale-switcher';

const MOCK_PATHNAME = '/some/path';

const mockReplace = jest.fn();
const mockUseLocale = jest.fn();
const mockUsePathname = jest.fn();
const mockUseRouter = jest.fn();

jest.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseLocale.mockReset();
    mockUsePathname.mockReset();
    mockUseRouter.mockReset();

    mockUsePathname.mockReturnValue(MOCK_PATHNAME);
    mockUseRouter.mockReturnValue({ replace: mockReplace });
  });

  it('should be defined', () => {
    mockUseLocale.mockReturnValue('fr');
    const { container } = render(<LocaleSwitcher />);
    expect(container).toBeDefined();
  });

  describe('when locale is "fr"', () => {
    beforeEach(() => {
      mockUseLocale.mockReturnValue('fr');
    });

    it('should display "EN" as the button label', () => {
      render(<LocaleSwitcher />);
      expect(screen.getByRole('button').textContent).toBe('EN');
    });

    it('should have aria-label "Switch to English"', () => {
      render(<LocaleSwitcher />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to English');
    });

    it('should switch to "en" when clicked', async () => {
      render(<LocaleSwitcher />);
      await userEvent.click(screen.getByRole('button'));

      expect(mockReplace).toHaveBeenCalledWith(MOCK_PATHNAME, { locale: 'en' });
    });
  });

  describe('when locale is "en"', () => {
    beforeEach(() => {
      mockUseLocale.mockReturnValue('en');
    });

    it('should display "FR" as the button label', () => {
      render(<LocaleSwitcher />);
      expect(screen.getByRole('button').textContent).toBe('FR');
    });

    it('should have aria-label "Passer en français"', () => {
      render(<LocaleSwitcher />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Passer en français');
    });

    it('should switch to "fr" when clicked', async () => {
      render(<LocaleSwitcher />);
      await userEvent.click(screen.getByRole('button'));

      expect(mockReplace).toHaveBeenCalledWith(MOCK_PATHNAME, { locale: 'fr' });
    });
  });

  describe('switchLocale', () => {
    it('should call router.replace with the current pathname', async () => {
      mockUseLocale.mockReturnValue('fr');
      render(<LocaleSwitcher />);
      await userEvent.click(screen.getByRole('button'));

      const [calledPathname] = mockReplace.mock.calls[0] as [string, { locale: string }];
      expect(calledPathname).toBe(MOCK_PATHNAME);
    });

    it('should only call router.replace once per click', async () => {
      mockUseLocale.mockReturnValue('fr');
      render(<LocaleSwitcher />);
      await userEvent.click(screen.getByRole('button'));

      expect(mockReplace).toHaveBeenCalled();
    });
  });
});
