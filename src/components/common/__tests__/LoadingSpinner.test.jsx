import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    
    expect(screen.getByRole('generic')).toBeInTheDocument();
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'text-blue-600', 'h-6', 'w-6');
  });

  test('renders with custom className', () => {
    const { container } = render(<LoadingSpinner className="h-10 w-10" />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin', 'text-blue-600', 'h-10', 'w-10');
    expect(spinner).not.toHaveClass('h-6', 'w-6');
  });

  test('has correct SVG structure', () => {
    const { container } = render(<LoadingSpinner />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    
    const circle = svg.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    expect(circle).toHaveClass('opacity-25');
    
    const path = svg.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass('opacity-75');
  });

  test('is wrapped in centered container', () => {
    const { container } = render(<LoadingSpinner />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'justify-center', 'items-center');
  });

  test('applies animation classes correctly', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('text-blue-600');
  });

  test('handles empty className prop', () => {
    const { container } = render(<LoadingSpinner className="" />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin', 'text-blue-600');
    expect(spinner.className).not.toContain('h-6 w-6');
  });

  test('renders multiple instances independently', () => {
    const { container } = render(
      <div>
        <LoadingSpinner className="h-4 w-4" />
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
    
    const spinners = container.querySelectorAll('svg');
    expect(spinners).toHaveLength(2);
    expect(spinners[0]).toHaveClass('h-4', 'w-4');
    expect(spinners[1]).toHaveClass('h-8', 'w-8');
  });

  test('maintains accessibility with proper role', () => {
    render(<LoadingSpinner />);
    
    // The wrapper div should be accessible
    const wrapper = screen.getByRole('generic');
    expect(wrapper).toBeInTheDocument();
  });

  test('PropTypes validation works correctly', () => {
    // Test that component accepts className as string
    expect(() => {
      render(<LoadingSpinner className="test-class" />);
    }).not.toThrow();
    
    // Test with undefined className (should use default)
    expect(() => {
      render(<LoadingSpinner />);
    }).not.toThrow();
  });

  test('has correct default export', () => {
    // Testing that the default export works
    const DefaultLoadingSpinner = require('../LoadingSpinner').default;
    const { container } = render(<DefaultLoadingSpinner />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });
});