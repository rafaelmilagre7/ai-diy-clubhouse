
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MilagrinhoAssistantProps {
  userName?: string;
  message?: string;
  className?: string;
}

const MilagrinhoAssistant: React.FC<MilagrinhoAssistantProps> = ({ 
  userName, 
  message, 
  className = "" 
}) => {
  return (
    <div className={`mb-8 rounded-lg bg-gradient-to-br from-[#0ABAB5]/75 to-[#15192C] border border-[#0ABAB5]/40 p-6 flex items-center gap-3 shadow-lg ${className}`}>
      <Avatar className="w-10 h-10">
        <AvatarImage 
          src="/lovable-uploads/833bbb5d-5aa6-47f4-96d2-320bb57726cf.png" 
          alt="Milagrinho Avatar" 
        />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-[#0ABAB5] text-base">
          Olá{userName ? `, ${userName}` : ""}!
        </p>
        <p className="text-white text-sm mt-1">
          {message || "Para te recomendar as melhores trilhas e soluções, me conta um pouco da empresa onde você trabalha!"}
        </p>
      </div>
    </div>
  );
};

export default MilagrinhoAssistant;
