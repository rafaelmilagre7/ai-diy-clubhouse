
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid, Achievement } from "@/components/achievements/AchievementGrid";
import { cn } from "@/lib/utils";

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
        orientation === "vertical" && "flex flex-col h-auto space-y-1"
      )}>
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="achievement" className="text-viverblue">Conquistas</TabsTrigger>
        <TabsTrigger value="revenue" className="text-revenue">Receita</TabsTrigger>
        <TabsTrigger value="operational" className="text-operational">Operacional</TabsTrigger>
        <TabsTrigger value="strategy" className="text-strategy">Estratégia</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="pt-4">
        <AchievementGrid achievements={filterAchievements(activeTab)} />
      </TabsContent>
    </Tabs>
  );
};
