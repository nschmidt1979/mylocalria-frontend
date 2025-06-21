import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SearchFilters } from '../SearchFilters';
import { getCurrentLocation } from '../../../services/geolocationService';

// Mock dependencies
jest.mock('../../../services/geolocationService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [
    new URLSearchParams('location=New York&q=advisor'),
    jest.fn()
  ],
}));

// Mock fetch for reverse geocoding
global.fetch = jest.fn();

const mockOnSearch = jest.fn();

describe('SearchFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentLocation.mockResolvedValue({
      latitude: 40.7128,
      longitude: -74.0060
    });
    
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        display_name: 'New York, NY, United States'
      })
    });
  });

  test('renders all form sections', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
    expect(screen.getByText('Specializations')).toBeInTheDocument();
    expect(screen.getByText('Certifications')).toBeInTheDocument();
  });

  test('initializes with URL search parameters', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    expect(screen.getByDisplayValue('advisor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
  });

  test('handles search query input', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText('Search');
    await user.clear(searchInput);
    await user.type(searchInput, 'financial planning');

    expect(searchInput).toHaveValue('financial planning');
  });

  test('handles location input', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const locationInput = screen.getByLabelText('Location');
    await user.clear(locationInput);
    await user.type(locationInput, 'Chicago, IL');

    expect(locationInput).toHaveValue('Chicago, IL');
  });

  test('handles distance selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const distanceSelect = screen.getByDisplayValue('Within 25 miles');
    await user.selectOptions(distanceSelect, '50');

    expect(screen.getByDisplayValue('Within 50 miles')).toBeInTheDocument();
  });

  test('handles minimum rating selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const ratingSelect = screen.getByDisplayValue('Any Rating');
    await user.selectOptions(ratingSelect, '4');

    expect(screen.getByDisplayValue('4+ Stars')).toBeInTheDocument();
  });

  test('handles specialization checkbox selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const retirementPlanningCheckbox = screen.getByRole('checkbox', { name: 'Retirement Planning' });
    await user.click(retirementPlanningCheckbox);

    expect(retirementPlanningCheckbox).toBeChecked();
  });

  test('handles certification checkbox selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const cfpCheckbox = screen.getByRole('checkbox', { name: 'CFP' });
    await user.click(cfpCheckbox);

    expect(cfpCheckbox).toBeChecked();
  });

  test('handles verified advisors checkbox', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const verifiedCheckbox = screen.getByRole('checkbox', { name: 'Verified Advisors Only' });
    await user.click(verifiedCheckbox);

    expect(verifiedCheckbox).toBeChecked();
  });

  test('handles fee-only advisors checkbox', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const feeOnlyCheckbox = screen.getByRole('checkbox', { name: 'Fee-Only Advisors' });
    await user.click(feeOnlyCheckbox);

    expect(feeOnlyCheckbox).toBeChecked();
  });

  test('handles current location button click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const locationButton = screen.getByRole('button');
    await user.click(locationButton);

    await waitFor(() => {
      expect(getCurrentLocation).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org/reverse')
      );
    });
  });

  test('shows loading state when getting current location', async () => {
    const user = userEvent.setup();
    getCurrentLocation.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const locationButton = screen.getByRole('button');
    await user.click(locationButton);

    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('animate-spin');
    expect(locationButton).toBeDisabled();
  });

  test('shows error when geolocation fails', async () => {
    const user = userEvent.setup();
    getCurrentLocation.mockRejectedValue(new Error('Location access denied'));
    
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const locationButton = screen.getByRole('button');
    await user.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText('Unable to get your location. Please enter it manually.')).toBeInTheDocument();
    });
  });

  test('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    // Set some filters first
    const cfpCheckbox = screen.getByRole('checkbox', { name: 'CFP' });
    await user.click(cfpCheckbox);

    const clearButton = screen.getByRole('button', { name: /Clear Filters/ });
    await user.click(clearButton);

    expect(cfpCheckbox).not.toBeChecked();
  });

  test('displays all specialization options', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const expectedSpecializations = [
      'Retirement Planning',
      'Investment Management',
      'Estate Planning',
      'Tax Planning',
      'Insurance Planning',
      'Education Planning',
      'Debt Management',
      'Wealth Management',
    ];

    expectedSpecializations.forEach(specialization => {
      expect(screen.getByRole('checkbox', { name: specialization })).toBeInTheDocument();
    });
  });

  test('displays all certification options', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const expectedCertifications = [
      'CFP',
      'CFA',
      'ChFC',
      'CLU',
      'CPA',
      'PFS',
      'AAMS',
      'CRPC',
    ];

    expectedCertifications.forEach(certification => {
      expect(screen.getByRole('checkbox', { name: certification })).toBeInTheDocument();
    });
  });

  test('has correct form styling', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  test('search input has correct placeholder and icon', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText('Search');
    expect(searchInput).toHaveAttribute('placeholder', 'Name, company, or expertise');
  });

  test('location input has correct placeholder', () => {
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const locationInput = screen.getByLabelText('Location');
    expect(locationInput).toHaveAttribute('placeholder', 'City, state, or zip code');
  });

  test('handles multiple checkbox selections correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    // Select multiple specializations
    const retirementCheckbox = screen.getByRole('checkbox', { name: 'Retirement Planning' });
    const investmentCheckbox = screen.getByRole('checkbox', { name: 'Investment Management' });
    
    await user.click(retirementCheckbox);
    await user.click(investmentCheckbox);

    expect(retirementCheckbox).toBeChecked();
    expect(investmentCheckbox).toBeChecked();

    // Uncheck one
    await user.click(retirementCheckbox);
    expect(retirementCheckbox).not.toBeChecked();
    expect(investmentCheckbox).toBeChecked();
  });

  test('renders specializations and certifications in scrollable containers', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchFilters onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const scrollableContainers = container.querySelectorAll('.max-h-32.overflow-y-auto');
    expect(scrollableContainers).toHaveLength(2); // One for specializations, one for certifications
  });
});