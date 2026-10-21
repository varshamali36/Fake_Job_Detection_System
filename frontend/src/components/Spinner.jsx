import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', label = null, className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size] || sizeClasses.md}`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
};

export default Spinner;
