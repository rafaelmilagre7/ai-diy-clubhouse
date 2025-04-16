
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const AchievementsHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col">
      <h1 className={isMobile ? "text-2xl font-bold" : "text-3xl font-bold"}>Suas Conquistas</h1>
      <p className={`text-muted-foreground ${isMobile ? "text-sm mt-1" : "mt-1"}`}>
        Acompanhe seu progresso e conquistas na plataforma
      </p>
    </div>
  );
};
