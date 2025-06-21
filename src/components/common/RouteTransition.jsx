import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const RouteTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Start loading when route changes
    setIsLoading(true);

    // Simulate a minimum loading time to prevent flickering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    // Listen for changes to the media query
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user prefers reduced motion, skip transitions
  if (prefersReducedMotion) {
    return <div className="transition-none">{children}</div>;
  }

  // Default with smooth transitions
  return (
    <div className="transition-opacity duration-300 ease-in-out">
      {children}
    </div>
  );
};

export default RouteTransition; 