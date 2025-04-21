
import React from "react";
import { Card } from "@/components/ui/card";

interface MilagrinhoMessageProps {
  message: string;
  type?: "info" | "success" | "warning";
  userName?: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({ 
  message, 
  type = "info",
  userName
}) => {
  const colors = {
    info: "bg-[#0ABAB5]/10 border-[#0ABAB5]/20 text-[#0ABAB5]",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };

  return (
    <Card className={`p-4 rounded-lg border ${colors[type]} flex items-start gap-3`}>
      <div className="w-8 h-8 rounded-full bg-[#0ABAB5] flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img 
          src="https://milagredigital.com/wp-content/uploads/2024/04/bot-avatar.webp" 
          alt="Milagrinho" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-gray-700">
          {userName && <span className="font-medium">Olá, {userName}! </span>}
          {message}
        </p>
      </div>
    </Card>
  );
};
