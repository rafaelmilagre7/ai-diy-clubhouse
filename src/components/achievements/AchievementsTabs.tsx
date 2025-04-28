
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";
import { AchievementGrid } from "./AchievementGrid";

interface AchievementsTabsProps {
  achievements: Achievement[];
  onCategoryChange?: (category: string) => void;
  orientation?: "vertical" | "horizontal";
  animateIds?: string[];
}

export const AchievementsTabs = ({ 
  achievements, 
  onCategoryChange,
  orientation = "horizontal",
  animateIds = []
}: AchievementsTabsProps) => {
  const [activeValue, setActiveValue] = useState("all");
  
  // Estatísticas baseadas nas conquistas
  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.isUnlocked).length,
    general: achievements.filter(a => a.category === "achievement").length,
    revenue: achievements.filter(a => a.category === "revenue").length,
    operational: achievements.filter(a => a.category === "operational").length,
    strategy: achievements.filter(a => a.category === "strategy").length
  };

  // Filtrar conquistas com base na categoria selecionada
  const filteredAchievements = activeValue === "all" 
    ? achievements 
    : achievements.filter(achievement => {
        if (activeValue === "unlocked") return achievement.isUnlocked;
        if (activeValue === "locked") return !achievement.isUnlocked;
        return achievement.category === activeValue;
      });
  
  const handleTabChange = (value: string) => {
    setActiveValue(value);
    if (onCategoryChange) {
      onCategoryChange(value);
    }
  };

  return (
    <Tabs 
      defaultValue="all" 
      value={activeValue} 
      onValueChange={handleTabChange}
      className="w-full"
      orientation={orientation === "vertical" ? "vertical" : "horizontal"}
    >
      <TabsList className={cn(
        "bg-muted/50 p-1 mb-6",
        orientation === "vertical" 
          ? "flex-col h-auto space-y-1 mr-4" 
          : "flex flex-wrap gap-1"
      )}>
        <TabsTrigger value="all" className={orientation === "vertical" ? "w-full justify-start" : ""}>
          Todas ({stats.total})
        </TabsTrigger>
        
        <TabsTrigger value="unlocked" className={orientation === "vertical" ? "w-full justify-start" : ""}>
          Desbloqueadas ({stats.unlocked})
        </TabsTrigger>
        
        <TabsTrigger value="locked" className={orientation === "vertical" ? "w-full justify-start" : ""}>
          Bloqueadas ({stats.total - stats.unlocked})
        </TabsTrigger>
        
        {stats.general > 0 && (
          <TabsTrigger 
            value="achievement" 
            className={cn(
              orientation === "vertical" ? "w-full justify-start" : "",
              "text-viverblue"
            )}
          >
            Gerais ({stats.general})
          </TabsTrigger>
        )}
        
        {stats.revenue > 0 && (
          <TabsTrigger 
            value="revenue" 
            className={cn(
              orientation === "vertical" ? "w-full justify-start" : "",
              "text-revenue"
            )}
          >
            Vendas ({stats.revenue})
          </TabsTrigger>
        )}
        
        {stats.operational > 0 && (
          <TabsTrigger 
            value="operational" 
            className={cn(
              orientation === "vertical" ? "w-full justify-start" : "",
              "text-operational"
            )}
          >
            Operações ({stats.operational})
          </TabsTrigger>
        )}
        
        {stats.strategy > 0 && (
          <TabsTrigger 
            value="strategy" 
            className={cn(
              orientation === "vertical" ? "w-full justify-start" : "",
              "text-strategy"
            )}
          >
            Estratégia ({stats.strategy})
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value={activeValue} className="mt-0">
        <AchievementGrid 
          achievements={filteredAchievements} 
          animateIds={animateIds}
        />
      </TabsContent>
    </Tabs>
  );
};
