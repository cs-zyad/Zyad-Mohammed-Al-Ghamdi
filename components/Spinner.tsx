
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
  </div>
);
