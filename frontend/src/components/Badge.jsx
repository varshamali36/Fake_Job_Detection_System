import React from 'react';

const Badge = ({ children, variant = 'info', size = 'md', className = '' }) => {
  const variantClasses = {
    genuine: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspicious: 'bg-rose-50 text-rose-700 border-rose-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variantClasses[variant] || variantClasses.info} ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
