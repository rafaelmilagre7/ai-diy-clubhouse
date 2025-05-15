
import React from 'react';

interface MilagrinhoMessageProps {
  message: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ message }) => {
  return (
    <div className="flex items-start gap-4 animate-fade-in mb-8">
      <div className="flex-shrink-0 w-12 h-12 bg-viverblue/20 rounded-full p-2 flex items-center justify-center">
        <span className="text-viverblue text-xl font-bold">M</span>
      </div>
      <div className="flex-grow bg-viverblue/5 backdrop-blur-sm rounded-lg p-4 border border-viverblue/10 relative">
        <div className="absolute left-[-8px] top-4 w-4 h-4 bg-viverblue/5 border-l border-t border-viverblue/10 transform rotate-45"></div>
        <p className="text-viverblue-light">{message}</p>
      </div>
    </div>
  );
};
