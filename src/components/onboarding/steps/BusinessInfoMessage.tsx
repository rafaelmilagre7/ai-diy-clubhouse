
import React from "react";

interface BusinessInfoMessageProps {
  userName?: string;
}

export const BusinessInfoMessage: React.FC<BusinessInfoMessageProps> = ({ userName }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0ABAB5]/20 px-5 py-4 shadow-none">
        <div className="flex items-center justify-center bg-[#eafaf9] rounded-full h-11 w-11">
          <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#0ABAB5"/>
            <text x="14" y="19" textAnchor="middle" fill="white" fontSize="17" fontFamily="Arial" fontWeight="bold">🤖</text>
          </svg>
        </div>
        <div>
          <span className="block text-[#0ABAB5] font-semibold mb-0.5" style={{ fontSize: 16 }}>
            {userName ? `E aí ${userName}!` : "Olá!"}
          </span>
          <span className="text-[#1A2228] text-base">
            Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você.
            <br className="hidden sm:block" />
            Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.
          </span>
        </div>
      </div>
    </div>
  );
};
