import React from 'react';

/**
 * Visual loading indicator component
 * 
 * @param {Object} props - Component properties
 * @param {boolean} [props.fullPage=false] - Centers spinner in viewport
 * @param {string} [props.size='medium'] - Size variant (small/medium/large)
 * @param {string} [props.color='text-blue-600'] - Tailwind text color class
 */
const Spinner = ({ fullPage = false, size = 'medium', color = 'text-blue-600' }) => {
  // Size configuration
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // Container positioning
  const containerClasses = fullPage 
    ? 'fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50'
    : 'inline-block';

  return (
    <div className={containerClasses}>
      <svg 
        className={`animate-spin ${color} ${sizeClasses[size]}`}
        viewBox="0 0 24 24"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;