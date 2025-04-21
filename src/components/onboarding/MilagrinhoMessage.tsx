
import React from 'react';

interface MilagrinhoMessageProps {
  message: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start space-x-4 p-4 bg-[#0ABAB5]/10 rounded-lg">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-[#0ABAB5] rounded-full flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};
