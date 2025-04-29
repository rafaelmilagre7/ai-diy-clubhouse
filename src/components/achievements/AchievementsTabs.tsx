
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/achievementTypes";

interface AchievementsTabsProps {
  achievements: Achievement[];
  orientation?: "horizontal" | "vertical";
  onCategoryChange?: (category: string) => void;
}

export const AchievementsTabs = ({ 
  achievements, 
  orientation = "horizontal",
  onCategoryChange 
}: AchievementsTabsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const filterAchievements = (tab: string) => {
    if (tab === "all") return achievements;
    return achievements.filter(a => a.category === tab);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onCategoryChange) {
      onCategoryChange(tab);
    }
  };

  return (
    <Tabs 
      defaultValue={activeTab} 
      onValueChange={handleTabChange} 
      className="space-y-4"
      orientation={orientation === "vertical" ? "vertical" : "horizontal"}
    >
      <TabsList className={cn(
        "bg-white p-1 shadow-sm",
        orientation === "vertical" ? "flex flex-col h-auto space-y-1" : "flex space-x-1"
      )}>
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
        >
          Todas
        </TabsTrigger>
        <TabsTrigger 
          value="achievement" 
          className="text-viverblue data-[state=active]:bg-viverblue/10 data-[state=active]:text-viverblue"
        >
          Conquistas
        </TabsTrigger>
        <TabsTrigger 
          value="revenue" 
          className="text-revenue data-[state=active]:bg-revenue/10 data-[state=active]:text-revenue"
        >
          Receita
        </TabsTrigger>
        <TabsTrigger 
          value="operational" 
          className="text-operational data-[state=active]:bg-operational/10 data-[state=active]:text-operational"
        >
          Operacional
        </TabsTrigger>
        <TabsTrigger 
          value="strategy" 
          className="text-strategy data-[state=active]:bg-strategy/10 data-[state=active]:text-strategy"
        >
          Estratégia
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="pt-4">
        <AchievementGrid achievements={filterAchievements(activeTab)} />
      </TabsContent>
    </Tabs>
  );
};
