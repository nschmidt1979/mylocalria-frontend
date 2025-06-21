import { render, screen } from '@testing-library/react';
import StarRating from '../StarRating';

describe('StarRating Component', () => {
  test('renders with default props', () => {
    const { container } = render(<StarRating />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    
    // Should render 5 stars by default (outOf = 5)
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(5);
  });

  test('renders correct number of stars based on outOf prop', () => {
    const { container } = render(<StarRating outOf={3} />);
    
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(3);
  });

  test('displays correct rating with filled stars', () => {
    const { container } = render(<StarRating rating={3} outOf={5} />);
    
    const stars = container.querySelectorAll('span');
    
    // First 3 stars should be fully opaque (rating of 3)
    expect(stars[0]).toHaveStyle('opacity: 1');
    expect(stars[1]).toHaveStyle('opacity: 1');
    expect(stars[2]).toHaveStyle('opacity: 1');
    
    // Remaining stars should be transparent (0.3 opacity)
    expect(stars[3]).toHaveStyle('opacity: 0.3');
    expect(stars[4]).toHaveStyle('opacity: 0.3');
  });

  test('handles partial ratings correctly', () => {
    const { container } = render(<StarRating rating={2.5} outOf={5} />);
    
    const stars = container.querySelectorAll('span');
    
    // First 2 stars should be fully opaque
    expect(stars[0]).toHaveStyle('opacity: 1');
    expect(stars[1]).toHaveStyle('opacity: 1');
    
    // Third star should be transparent (2.5 rounds down for display)
    expect(stars[2]).toHaveStyle('opacity: 0.3');
  });

  test('applies custom className', () => {
    const { container } = render(<StarRating className="custom-class" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'custom-class');
  });

  test('uses custom size prop', () => {
    const { container } = render(<StarRating size={12} />);
    
    const stars = container.querySelectorAll('span');
    stars.forEach(star => {
      expect(star).toHaveClass('w-12', 'h-12');
    });
  });

  test('renders SVG stars with correct structure', () => {
    const { container } = render(<StarRating rating={1} />);
    
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(5);
    
    svgs.forEach(svg => {
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('fill', 'white');
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
      
      const path = svg.querySelector('path');
      expect(path).toBeInTheDocument();
    });
  });

  test('handles zero rating', () => {
    const { container } = render(<StarRating rating={0} />);
    
    const stars = container.querySelectorAll('span');
    stars.forEach(star => {
      expect(star).toHaveStyle('opacity: 0.3');
    });
  });

  test('handles rating higher than outOf', () => {
    const { container } = render(<StarRating rating={7} outOf={5} />);
    
    const stars = container.querySelectorAll('span');
    // All stars should be filled when rating exceeds outOf
    stars.forEach(star => {
      expect(star).toHaveStyle('opacity: 1');
    });
  });

  test('handles negative rating', () => {
    const { container } = render(<StarRating rating={-1} />);
    
    const stars = container.querySelectorAll('span');
    stars.forEach(star => {
      expect(star).toHaveStyle('opacity: 0.3');
    });
  });

  test('star styling and positioning', () => {
    const { container } = render(<StarRating size={10} />);
    
    const stars = container.querySelectorAll('span');
    stars.forEach((star, index) => {
      expect(star).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(star).toHaveClass('w-10', 'h-10');
      expect(star).toHaveClass('bg-red-500', 'rounded-md');
      
      // All stars except the last should have margin-right
      if (index < stars.length - 1) {
        expect(star).toHaveClass('mr-1');
      } else {
        expect(star).toHaveClass('last:mr-0');
      }
    });
  });

  test('SVG size adjusts with star size', () => {
    const { container } = render(<StarRating size={10} />);
    
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      // SVG should be size - 3 = 7
      expect(svg).toHaveClass('w-7', 'h-7');
    });
  });

  test('renders with different combinations of props', () => {
    const { container } = render(
      <StarRating rating={4} outOf={10} size={6} className="test-rating" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'test-rating');
    
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(10);
    expect(stars[0]).toHaveClass('w-6', 'h-6');
    
    // First 4 stars should be filled
    for (let i = 0; i < 4; i++) {
      expect(stars[i]).toHaveStyle('opacity: 1');
    }
    
    // Remaining stars should be transparent
    for (let i = 4; i < 10; i++) {
      expect(stars[i]).toHaveStyle('opacity: 0.3');
    }
  });
});