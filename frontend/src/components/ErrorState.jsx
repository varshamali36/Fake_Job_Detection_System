import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = "Something went wrong", message = "An error occurred while loading data. Please try again.", onRetry = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-50/50 rounded-2xl border border-rose-100">
      <div className="w-16 h-16 mb-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
