
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { Rocket, Award, BadgeCheck, Medal, Star, CheckCheck, Clock, Users, FileCheck, CalendarCheck, Trophy } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface AchievementIconProps {
  achievement: Achievement;
}

export const AchievementIcon = ({ achievement }: AchievementIconProps) => {
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (achievement.isUnlocked && iconRef.current) {
      iconRef.current.classList.add("item-pop");
      setTimeout(() => iconRef.current?.classList.remove("item-pop"), 650);
    }
  }, [achievement.isUnlocked]);

  // Função para determinar qual ícone usar baseado na conquista
  const getIconComponent = () => {
    // IDs específicos
    if (achievement.id.includes("primeira") || achievement.id === 'achievement-pioneer') return Rocket;
    if (achievement.id.includes("streak")) return CalendarCheck;
    if (achievement.id.includes("completo")) return FileCheck;
    if (achievement.id.includes("implementacao")) return CheckCheck;
    if (achievement.id.includes("social") || achievement.id.includes("comentario")) return Users;
    if (achievement.id.includes("tempo") || achievement.id.includes("dias")) return Clock;
    
    // Baseado na categoria
    switch (achievement.category) {
      case "revenue":
        return Star;
      case "operational":
        return CheckCheck;
      case "strategy":
        return FileCheck;
      case "achievement":
        return Award;
      default:
        return Trophy; // Ícone padrão
    }
  };

  const getIconColor = () => {
    if (!achievement.isUnlocked) return "text-gray-400";
    
    switch (achievement.category) {
      case "revenue":
        return "text-revenue";
      case "operational":
        return "text-operational";
      case "strategy":
        return "text-strategy";
      case "achievement":
        return "text-viverblue";
      default:
        return "text-viverblue";
    }
  };

  const getGradientClass = () => {
    if (!achievement.isUnlocked) return "bg-gray-100";
    
    switch (achievement.category) {
      case "revenue":
        return "from-revenue/20 to-revenue/10 shadow-revenue/20";
      case "operational":
        return "from-operational/20 to-operational/10 shadow-operational/20";
      case "strategy":
        return "from-strategy/20 to-strategy/10 shadow-strategy/20";
      case "achievement":
        return "from-viverblue/20 to-viverblue/10 shadow-viverblue/20";
      default:
        return "from-viverblue/20 to-viverblue/10 shadow-viverblue/20";
    }
  };

  const Icon = getIconComponent();

  return (
    <div className={cn(
      "relative group",
      "w-20 h-20 rounded-full flex items-center justify-center",
      "transition-all duration-300 transform hover:scale-105",
      achievement.isUnlocked && [
        "bg-gradient-to-br shadow-lg",
        getGradientClass()
      ],
      !achievement.isUnlocked && "bg-gray-100"
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]",
        achievement.isUnlocked && [
          achievement.category === "revenue" && "from-revenue/30 via-transparent to-transparent",
          achievement.category === "operational" && "from-operational/30 via-transparent to-transparent",
          achievement.category === "strategy" && "from-strategy/30 via-transparent to-transparent",
          achievement.category === "achievement" && "from-viverblue/30 via-transparent to-transparent"
        ]
      )} />
      <Icon ref={iconRef} className={cn(
        "h-10 w-10 relative z-10 transition-transform duration-300 group-hover:scale-110",
        getIconColor()
      )} />
    </div>
  );
};
