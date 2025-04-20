
import React from "react";

interface MilagrinhoMessageProps {
  userName?: string;
  message: string;
  variant?: "default" | "compact";
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ 
  userName, 
  message,
  variant = "default"
}) => {
  // Extrair o primeiro nome se o username contiver espaços
  const firstName = userName?.split(' ')[0];
  
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0ABAB5]/20 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-center bg-[#eafaf9] rounded-full h-11 w-11">
        <span className="text-[#0ABAB5] text-xl">🤖</span>
      </div>
      <div>
        {userName && variant === "default" && (
          <span className="block text-[#0ABAB5] font-semibold mb-0.5" style={{ fontSize: 16 }}>
            E aí {firstName}!
          </span>
        )}
        <span className="text-[#1A2228] text-sm">
          {message}
        </span>
      </div>
    </div>
  );
};
