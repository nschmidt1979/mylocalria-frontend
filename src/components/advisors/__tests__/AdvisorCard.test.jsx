import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdvisorCard from '../AdvisorCard';

const mockAdvisor = {
  id: '1',
  primary_business_name: 'Test Financial Advisory',
  crd_number: '123456',
  principal_office_address_1: '123 Main St',
  principal_office_address_2: 'Suite 100',
  principal_office_city: 'New York', 
  principal_office_state: 'NY',
  principal_office_postal_code: '10001',
  principal_office_telephone_number: '(212) 555-0123',
  website_address: 'https://testadvisor.com',
  '5b1_how_many_employees_perform_investmen': '5',
  '5f2_assets_under_management_total_number': '100',
  '5f2_assets_under_management_total_us_dol': '$50,000,000',
  status_effective_date: '2023-01-01'
};

const renderAdvisorCard = (advisor = mockAdvisor) => {
  return render(
    <MemoryRouter>
      <AdvisorCard advisor={advisor} />
    </MemoryRouter>
  );
};

describe('AdvisorCard Component', () => {
  test('renders advisor card with all required information', () => {
    renderAdvisorCard();

    // Check primary business name
    expect(screen.getByText('Test Financial Advisory')).toBeInTheDocument();
    
    // Check CRD number
    expect(screen.getByText(/CRD Number:/)).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    
    // Check address
    expect(screen.getByText(/Address:/)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, Suite 100, New York, NY 10001/)).toBeInTheDocument();
    
    // Check phone
    expect(screen.getByText(/Phone:/)).toBeInTheDocument();
    expect(screen.getByText('(212) 555-0123')).toBeInTheDocument();
    
    // Check website
    expect(screen.getByText(/Website:/)).toBeInTheDocument();
    const websiteLink = screen.getByRole('link', { name: 'https://testadvisor.com' });
    expect(websiteLink).toHaveAttribute('href', 'https://testadvisor.com');
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders advisor card without optional address line 2', () => {
    const advisorWithoutAddress2 = {
      ...mockAdvisor,
      principal_office_address_2: null
    };
    
    renderAdvisorCard(advisorWithoutAddress2);
    
    // Should not include the extra comma and address line 2
    expect(screen.getByText(/123 Main St, New York, NY 10001/)).toBeInTheDocument();
  });

  test('renders View Profile link with correct href', () => {
    renderAdvisorCard();
    
    const viewProfileLink = screen.getByRole('link', { name: 'View Profile' });
    expect(viewProfileLink).toHaveAttribute('href', '/advisors/1');
    expect(viewProfileLink).toHaveClass('inline-block', 'px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded');
  });

  test('displays all financial information correctly', () => {
    renderAdvisorCard();
    
    expect(screen.getByText(/Employees Performing Investment:/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    expect(screen.getByText(/Assets Under Management \(Number\):/)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    
    expect(screen.getByText(/Assets Under Management \(USD\):/)).toBeInTheDocument();
    expect(screen.getByText('$50,000,000')).toBeInTheDocument();
    
    expect(screen.getByText(/Status Effective Date:/)).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
  });

  test('handles missing or undefined advisor data gracefully', () => {
    const incompleteAdvisor = {
      id: '2',
      primary_business_name: 'Incomplete Advisor',
      crd_number: null,
      principal_office_address_1: '',
      website_address: null
    };
    
    renderAdvisorCard(incompleteAdvisor);
    
    expect(screen.getByText('Incomplete Advisor')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Profile' })).toHaveAttribute('href', '/advisors/2');
  });

  test('applies correct CSS classes for styling', () => {
    const { container } = renderAdvisorCard();
    
    const cardContainer = container.firstChild;
    expect(cardContainer).toHaveClass('p-4', 'bg-white', 'rounded', 'shadow');
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-lg', 'font-bold');
  });

  test('renders website link with security attributes', () => {
    renderAdvisorCard();
    
    const websiteLink = screen.getByRole('link', { name: 'https://testadvisor.com' });
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(websiteLink).toHaveClass('text-blue-600', 'underline');
  });

  test('handles empty string values in advisor data', () => {
    const advisorWithEmptyValues = {
      ...mockAdvisor,
      principal_office_address_2: '',
      website_address: '',
      '5b1_how_many_employees_perform_investmen': '',
    };
    
    renderAdvisorCard(advisorWithEmptyValues);
    
    // Should still render the component without errors
    expect(screen.getByText('Test Financial Advisory')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Profile' })).toBeInTheDocument();
  });
});