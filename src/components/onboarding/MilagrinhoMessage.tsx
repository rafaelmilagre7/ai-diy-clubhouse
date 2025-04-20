
import React from "react";

interface MilagrinhoMessageProps {
  userName?: string;
  message: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ 
  userName, 
  message 
}) => {
  // Extrair o primeiro nome completo em vez de apenas o primeiro nome
  const fullName = userName || "";
  
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0ABAB5]/20 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-center bg-[#eafaf9] rounded-full h-11 w-11">
        <span className="text-[#0ABAB5] text-xl">🤖</span>
      </div>
      <div>
        <span className="block text-[#0ABAB5] font-semibold mb-0.5" style={{ fontSize: 16 }}>
          {fullName ? `E aí ${fullName}!` : "Olá!"}
        </span>
        <span className="text-[#1A2228] text-sm">
          {message}
        </span>
      </div>
    </div>
  );
};
