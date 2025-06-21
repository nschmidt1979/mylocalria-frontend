import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from '../SearchFilters';

const mockOnFilterChange = jest.fn();

const defaultProps = {
  onFilterChange: mockOnFilterChange,
  initialFilters: {}
};

describe('SearchFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all filter sections', () => {
    render(<SearchFilters {...defaultProps} />);

    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Minimum')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  test('initializes with provided initial filters', () => {
    const initialFilters = {
      location: 'New York, NY',
      minRating: 4,
      accountMinimum: '50000',
      services: ['financial_planning', 'investment_management']
    };

    render(<SearchFilters {...defaultProps} initialFilters={initialFilters} />);

    expect(screen.getByDisplayValue('New York, NY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('$50,000+')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Financial Planning' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Investment Management' })).toBeChecked();
  });

  test('handles location input changes', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const locationInput = screen.getByLabelText('Location');
    await user.type(locationInput, 'Chicago, IL');

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Chicago, IL'
      })
    );
  });

  test('handles minimum rating selection', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const rating4Button = screen.getByRole('button', { name: '4+' });
    await user.click(rating4Button);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minRating: 4
      })
    );
  });

  test('handles account minimum selection', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const accountMinimumSelect = screen.getByLabelText('Account Minimum');
    await user.selectOptions(accountMinimumSelect, '100000');

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        accountMinimum: '100000'
      })
    );
  });

  test('handles service checkbox toggles', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const financialPlanningCheckbox = screen.getByRole('checkbox', { name: 'Financial Planning' });
    await user.click(financialPlanningCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        services: ['financial_planning']
      })
    );

    // Toggle the same checkbox off
    await user.click(financialPlanningCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        services: []
      })
    );
  });

  test('handles multiple service selections', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const financialPlanningCheckbox = screen.getByRole('checkbox', { name: 'Financial Planning' });
    const investmentManagementCheckbox = screen.getByRole('checkbox', { name: 'Investment Management' });

    await user.click(financialPlanningCheckbox);
    await user.click(investmentManagementCheckbox);

    expect(mockOnFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        services: ['financial_planning', 'investment_management']
      })
    );
  });

  test('reset filters button clears all filters', async () => {
    const user = userEvent.setup();
    const initialFilters = {
      location: 'New York, NY',
      minRating: 4,
      accountMinimum: '50000',
      services: ['financial_planning']
    };

    render(<SearchFilters {...defaultProps} initialFilters={initialFilters} />);

    const resetButton = screen.getByRole('button', { name: 'Reset Filters' });
    await user.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      location: '',
      minRating: 0,
      accountMinimum: '',
      services: []
    });
  });

  test('displays all service options', () => {
    render(<SearchFilters {...defaultProps} />);

    const expectedServices = [
      'Financial Planning',
      'Investment Management',
      'Retirement Planning',
      'Estate Planning',
      'Tax Planning'
    ];

    expectedServices.forEach(service => {
      expect(screen.getByRole('checkbox', { name: service })).toBeInTheDocument();
    });
  });

  test('displays all account minimum options', () => {
    render(<SearchFilters {...defaultProps} />);

    const accountMinimumSelect = screen.getByLabelText('Account Minimum');
    const options = Array.from(accountMinimumSelect.querySelectorAll('option')).map(option => option.textContent);

    expect(options).toEqual([
      'Any',
      'No Minimum',
      '$10,000+',
      '$50,000+',
      '$100,000+',
      '$500,000+'
    ]);
  });

  test('displays all rating options', () => {
    render(<SearchFilters {...defaultProps} />);

    const ratingButtons = ['Any', '3+', '3.5+', '4+', '4.5+'];
    ratingButtons.forEach(rating => {
      expect(screen.getByRole('button', { name: rating })).toBeInTheDocument();
    });
  });

  test('applies correct styling to selected rating', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const rating4Button = screen.getByRole('button', { name: '4+' });
    await user.click(rating4Button);

    expect(rating4Button).toHaveClass('bg-primary-100', 'text-primary-800');
  });

  test('applies correct styling to unselected ratings', () => {
    render(<SearchFilters {...defaultProps} />);

    const anyRatingButton = screen.getByRole('button', { name: 'Any' });
    expect(anyRatingButton).toHaveClass('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
  });

  test('handles empty initial filters gracefully', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    // Should render without errors
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toHaveValue('');
  });

  test('calls onFilterChange with complete filter object', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);

    const locationInput = screen.getByLabelText('Location');
    await user.type(locationInput, 'Test City');

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      location: 'Test City',
      minRating: 0,
      accountMinimum: '',
      services: []
    });
  });

  test('maintains other filters when one filter changes', async () => {
    const user = userEvent.setup();
    const initialFilters = {
      location: 'New York',
      minRating: 4,
      accountMinimum: '50000',
      services: ['financial_planning']
    };

    render(<SearchFilters {...defaultProps} initialFilters={initialFilters} />);

    const retirementCheckbox = screen.getByRole('checkbox', { name: 'Retirement Planning' });
    await user.click(retirementCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      location: 'New York',
      minRating: 4,
      accountMinimum: '50000',
      services: ['financial_planning', 'retirement_planning']
    });
  });

  test('component has correct styling and layout', () => {
    const { container } = render(<SearchFilters {...defaultProps} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6', 'space-y-6');
  });
});