import React from 'react';
import PropTypes from 'prop-types';

const ImageWithAlt = ({ 
  src, 
  alt, 
  className = '', 
  fallbackText = '',
  loading = 'lazy',
  ...props 
}) => {
  // Generate descriptive alt text if not provided
  const getAltText = () => {
    if (alt) return alt;
    if (fallbackText) return fallbackText;
    
    // Extract filename and create basic alt text
    const filename = src?.split('/').pop()?.split('.')[0];
    return filename ? `Image: ${filename.replace(/[-_]/g, ' ')}` : 'Image';
  };

  const handleImageError = (e) => {
    // Hide broken images
    e.target.style.display = 'none';
  };

  return (
    <img
      src={src}
      alt={getAltText()}
      className={className}
      loading={loading}
      onError={handleImageError}
      {...props}
    />
  );
};

ImageWithAlt.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallbackText: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager'])
};

export default ImageWithAlt;