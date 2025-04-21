
import React from 'react';

interface MilagrinhoMessageProps {
  message: string;
  userName?: string;
  type?: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ message, userName, type = 'default' }) => {
  // Definir classes CSS com base no tipo de mensagem
  const getBackgroundColor = () => {
    switch (type) {
      case 'info':
        return 'bg-[#0ABAB5]/10';
      case 'warning':
        return 'bg-amber-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-[#0ABAB5]/10';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'info':
        return 'border-[#0ABAB5]/20';
      case 'warning':
        return 'border-amber-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-[#0ABAB5]/20';
    }
  };

  return (
    <div className={`flex items-start space-x-4 p-4 ${getBackgroundColor()} rounded-lg border ${getBorderColor()}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-[#0ABAB5] rounded-full flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
      </div>
      <div className="flex-1">
        {userName && (
          <p className="font-semibold text-[#0ABAB5] text-base mb-1">
            Olá, {userName}!
          </p>
        )}
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};
