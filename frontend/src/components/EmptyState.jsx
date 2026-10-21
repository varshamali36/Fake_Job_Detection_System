import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ title = "No records found", message = "Try adjusting your search filters or submit a new job posting for analysis.", icon: Icon = SearchX, action = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
