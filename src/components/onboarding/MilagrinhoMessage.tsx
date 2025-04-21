
import React from 'react';

interface MilagrinhoMessageProps {
  message: string;
  userName?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({
  message,
  userName,
  type = 'info'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-[#0ABAB5]/10 border-[#0ABAB5]/30 text-[#0ABAB5]';
    }
  };

  return (
    <div className={`rounded-lg p-4 border ${getTypeStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
        </div>
        <div className="flex-1">
          {userName && (
            <p className="font-medium mb-1">Olá, {userName}!</p>
          )}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};
