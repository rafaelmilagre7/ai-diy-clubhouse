
import React from "react";

interface MilagrinhoMessageProps {
  message: string;
  title?: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({
  message,
  title
}) => {
  return (
    <div className="bg-gradient-to-r from-[#1E2235] to-[#151823] rounded-lg p-6 border border-neutral-700/50 shadow-md">
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">{title}</h2>
      )}
      <div className="flex">
        <div className="mr-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            M
          </div>
        </div>
        <div className="text-neutral-300">
          <p className="whitespace-pre-line">{message}</p>
        </div>
      </div>
    </div>
  );
};
