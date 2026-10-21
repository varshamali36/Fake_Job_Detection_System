import React from 'react';

const ProgressBar = ({ value, max = 100, label = null, showPercentage = true, color = 'blue', className = '' }) => {
  const percentage = Math.min(Math.max(roundToTwo((value / max) * 100), 0), 100);

  function roundToTwo(num) {
    return Math.round(num * 100) / 100;
  }

  const colorClasses = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
    gradient: 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color] || colorClasses.blue}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
