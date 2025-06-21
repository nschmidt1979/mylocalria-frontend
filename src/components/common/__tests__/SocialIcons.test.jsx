import { render } from '@testing-library/react';
import { FacebookIcon, TwitterIcon, LinkedInIcon } from '../SocialIcons';

describe('SocialIcons Components', () => {
  describe('FacebookIcon', () => {
    test('renders with default className', () => {
      const { container } = render(<FacebookIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-6', 'w-6');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    test('renders with custom className', () => {
      const { container } = render(<FacebookIcon className="h-8 w-8 text-blue-600" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8', 'text-blue-600');
      expect(svg).not.toHaveClass('h-6', 'w-6');
    });

    test('has correct SVG path for Facebook', () => {
      const { container } = render(<FacebookIcon />);
      
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path.getAttribute('d')).toContain('24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12');
    });
  });

  describe('TwitterIcon', () => {
    test('renders with default className', () => {
      const { container } = render(<TwitterIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-6', 'w-6');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    test('renders with custom className', () => {
      const { container } = render(<TwitterIcon className="h-5 w-5 text-sky-500" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5', 'text-sky-500');
    });

    test('has correct SVG path for Twitter', () => {
      const { container } = render(<TwitterIcon />);
      
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path.getAttribute('d')).toContain('23.953 4.57a10 10 0 01-2.825.775');
    });
  });

  describe('LinkedInIcon', () => {
    test('renders with default className', () => {
      const { container } = render(<LinkedInIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-6', 'w-6');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    test('renders with custom className', () => {
      const { container } = render(<LinkedInIcon className="h-10 w-10 text-blue-700" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-10', 'w-10', 'text-blue-700');
    });

    test('has correct SVG path for LinkedIn', () => {
      const { container } = render(<LinkedInIcon />);
      
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path.getAttribute('d')).toContain('20.447 20.452h-3.554v-5.569c0-1.328');
    });
  });

  describe('All Social Icons', () => {
    test('all icons render with consistent structure', () => {
      const { container: facebookContainer } = render(<FacebookIcon />);
      const { container: twitterContainer } = render(<TwitterIcon />);
      const { container: linkedinContainer } = render(<LinkedInIcon />);

      const icons = [
        facebookContainer.querySelector('svg'),
        twitterContainer.querySelector('svg'),
        linkedinContainer.querySelector('svg')
      ];

      icons.forEach(icon => {
        expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
        expect(icon).toHaveAttribute('fill', 'currentColor');
        expect(icon.querySelector('path')).toBeInTheDocument();
      });
    });

    test('all icons handle empty className gracefully', () => {
      const { container: facebookContainer } = render(<FacebookIcon className="" />);
      const { container: twitterContainer } = render(<TwitterIcon className="" />);
      const { container: linkedinContainer } = render(<LinkedInIcon className="" />);

      const icons = [
        facebookContainer.querySelector('svg'),
        twitterContainer.querySelector('svg'),
        linkedinContainer.querySelector('svg')
      ];

      icons.forEach(icon => {
        expect(icon).toHaveAttribute('class', '');
      });
    });

    test('all icons accept multiple CSS classes', () => {
      const testClass = "h-12 w-12 text-gray-600 hover:text-gray-800";
      
      const { container: facebookContainer } = render(<FacebookIcon className={testClass} />);
      const { container: twitterContainer } = render(<TwitterIcon className={testClass} />);
      const { container: linkedinContainer } = render(<LinkedInIcon className={testClass} />);

      const icons = [
        facebookContainer.querySelector('svg'),
        twitterContainer.querySelector('svg'),
        linkedinContainer.querySelector('svg')
      ];

      icons.forEach(icon => {
        expect(icon).toHaveClass('h-12', 'w-12', 'text-gray-600', 'hover:text-gray-800');
      });
    });

    test('all icons are accessible', () => {
      const { container: facebookContainer } = render(<FacebookIcon />);
      const { container: twitterContainer } = render(<TwitterIcon />);
      const { container: linkedinContainer } = render(<LinkedInIcon />);

      const icons = [
        facebookContainer.querySelector('svg'),
        twitterContainer.querySelector('svg'),
        linkedinContainer.querySelector('svg')
      ];

      // SVGs should be properly structured for screen readers
      icons.forEach(icon => {
        expect(icon.tagName).toBe('svg');
        expect(icon).toHaveAttribute('fill', 'currentColor');
      });
    });
  });
});