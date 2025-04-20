
import React from "react";

interface MilagrinhoAssistantProps {
  userName?: string;
}

const MilagrinhoAssistant: React.FC<MilagrinhoAssistantProps> = ({ userName }) => {
  return (
    <div className="mb-8 rounded-lg bg-gradient-to-br from-[#0ABAB5]/75 to-[#15192C] border border-[#0ABAB5]/40 p-6 flex items-center gap-3 shadow-lg">
      <span className="text-[#0ABAB5] text-3xl">🤖</span>
      <div>
        <p className="font-semibold text-[#0ABAB5] text-base">
          Olá{userName ? `, ${userName}` : ""}!
        </p>
        <p className="text-white text-sm mt-1">
          Para te recomendar as melhores trilhas e soluções, me conta um pouco da empresa onde você trabalha!
        </p>
      </div>
    </div>
  );
};

export default MilagrinhoAssistant;
