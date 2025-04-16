
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid, Achievement } from "@/components/achievements/AchievementGrid";

interface AchievementsTabsProps {
  achievements: Achievement[];
}

export const AchievementsTabs = ({ achievements }: AchievementsTabsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const filterAchievements = (tab: string) => {
    if (tab === "all") return achievements;
    return achievements.filter(a => a.category === tab);
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
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
