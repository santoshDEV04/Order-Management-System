import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading data...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[var(--text-muted)] mb-2.5`} />
      {message && (
        <p className="text-xs text-[var(--text-muted)] font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
