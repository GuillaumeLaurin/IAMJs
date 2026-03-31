import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAB from '@/components/ui/fab/fab';

const TEST_TITLE = 'add';

const TEST_LABEL = 'Test Label';

const mockUseTranslations = jest.fn();

const mockFab = {
  onClick: jest.fn(),
  title: TEST_TITLE,
  label: TEST_LABEL,
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

describe('FAB', () => {
  beforeEach(() => {
    mockUseTranslations.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    const { container } = render(<FAB onClick={mockFab.onClick} title={mockFab.title}  label={mockFab.label} />);
    expect(container).toBeDefined();
  });

  it('should display the label', () => {
    render(<FAB onClick={mockFab.onClick} title={mockFab.title}  label={mockFab.label} />);
    expect(screen.getByLabelText(TEST_LABEL)).toBeDefined();
  });

  it('should display the button text', () => {
    render(<FAB onClick={mockFab.onClick} title={mockFab.title}  label={mockFab.label} />);
    expect(screen.getByText(TEST_TITLE)).toBeDefined();
  });

  it('should execute onClick function when clicked', async () => {
    render(<FAB onClick={mockFab.onClick} title={mockFab.title}  label={mockFab.label} />);
    await userEvent.click(screen.getByText(TEST_TITLE));
    await waitFor(() => {
      expect(mockFab.onClick).toHaveBeenCalled();
    });
  });
});