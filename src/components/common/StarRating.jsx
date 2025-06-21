import React from 'react';

const StarRating = ({ 
  rating = 0, 
  outOf = 5, 
  className = '', 
  size = 8, 
  interactive = false, 
  onChange,
  label,
  disabled = false 
}) => {
  const handleKeyDown = (event, starIndex) => {
    if (!interactive || disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onChange?.(starIndex + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (starIndex > 0) {
          document.getElementById(`star-${starIndex - 1}`)?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (starIndex < outOf - 1) {
          document.getElementById(`star-${starIndex + 1}`)?.focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        document.getElementById(`star-0`)?.focus();
        break;
      case 'End':
        event.preventDefault();
        document.getElementById(`star-${outOf - 1}`)?.focus();
        break;
      default:
        break;
    }
  };

  const stars = [];
  for (let i = 0; i < outOf; i++) {
    const isActive = i < rating;
    const starElement = (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill={isActive ? "currentColor" : "none"} 
        viewBox="0 0 20 20" 
        className={`w-${size - 3} h-${size - 3}`}
        stroke="currentColor"
        strokeWidth={isActive ? 0 : 1}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
    );

    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          id={`star-${i}`}
          role="radio"
          aria-checked={i < rating}
          aria-setsize={outOf}
          aria-posinset={i + 1}
          aria-label={`${i + 1} star${i + 1 > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => onChange?.(i + 1)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`inline-flex items-center justify-center w-${size} h-${size} rounded-sm mr-1 last:mr-0 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
            isActive 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-300 hover:text-gray-400'
          } ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer'
          }`}
        >
          {starElement}
        </button>
      );
    } else {
      stars.push(
        <span
          key={i}
          className={`inline-flex items-center justify-center w-${size} h-${size} mr-1 last:mr-0 ${
            isActive ? 'text-yellow-500' : 'text-gray-400'
          }`}
          aria-hidden="true"
        >
          {starElement}
        </span>
      );
    }
  }

  if (interactive) {
    return (
      <div 
        className={`flex ${className}`}
        role="radiogroup"
        aria-label={label || `Rate from 1 to ${outOf} stars`}
        aria-describedby={label ? undefined : "star-rating-description"}
      >
        {stars}
        {!label && (
          <span id="star-rating-description" className="sr-only">
            Use arrow keys to navigate, Enter or Space to select
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex ${className}`}
      role="img"
      aria-label={`${rating} out of ${outOf} stars`}
    >
      {stars}
      <span className="sr-only">{rating} out of {outOf} stars</span>
    </div>
  );
};

export default StarRating; 