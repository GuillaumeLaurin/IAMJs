import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import FAB from '@/components/ui/fab/fab';

const TEST_LABEL = 'Test Label';

const MOCK_TRANSLATIONS: Record<string, string> = {
  add: 'ajouter',
};

const mockUseTranslations = jest.fn();

const mockFab = {
  onClick: jest.fn(),
  label: TEST_LABEL,
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

describe('FAB', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();

    mockUseTranslations.mockImplementation((namespace) => {
      const translations = MOCK_TRANSLATIONS;
        return (key: string) => translations[key] ?? key;
    })
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    const { container } = render(<FAB onClick={mockFab.onClick} label={TEST_LABEL} />);
    expect(container).toBeDefined();
  });

  it('should display the label', () => {
    render(<FAB onClick={mockFab.onClick} label={TEST_LABEL} />);
    expect(screen.getByLabelText(TEST_LABEL)).toBeDefined();
  });

  it('should display the button action label', () => {
    render(<FAB onClick={mockFab.onClick} label={TEST_LABEL} />);
    expect(screen.getByText(MOCK_TRANSLATIONS.add)).toBeDefined();
  });

  it('should execute onClick function when clicked', async () => {
    render(<FAB onClick={mockFab.onClick} label={TEST_LABEL} />);
    await userEvent.click(screen.getByText(MOCK_TRANSLATIONS.add));
    await waitFor(() => {
      expect(mockFab.onClick).toHaveBeenCalled();
    });
  });
});