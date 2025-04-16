
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CheckCircle, Award } from "lucide-react";
import { StatsTabContent } from "./StatsTabContent";
import { ImplementationsTabContent } from "./ImplementationsTabContent";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { Implementation, UserAchievement } from "@/hooks/useProfileData";
import { UserStats } from "@/hooks/useUserStats";

interface ProfileTabsProps {
  defaultTab: string;
  implementations: Implementation[];
  achievements: UserAchievement[];
  stats: UserStats;
}

export const ProfileTabs = ({ 
  defaultTab, 
  implementations, 
  achievements, 
  stats 
}: ProfileTabsProps) => {
  // Convert UserAchievement[] to Achievement[] for the AchievementGrid
  const formattedAchievements = achievements.map(achievement => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    category: achievement.category as "operational" | "revenue" | "strategy" | "achievement",
    isUnlocked: achievement.isUnlocked,
    earnedAt: achievement.earnedAt,
    requiredCount: achievement.requiredCount,
    currentCount: achievement.currentCount
  }));

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="stats">
          <BarChart className="mr-2 h-4 w-4" />
          Estatísticas
        </TabsTrigger>
        <TabsTrigger value="implementations">
          <CheckCircle className="mr-2 h-4 w-4" />
          Implementações
        </TabsTrigger>
        <TabsTrigger value="badges">
          <Award className="mr-2 h-4 w-4" />
          Conquistas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats" className="mt-6">
        <StatsTabContent stats={stats} implementations={implementations} />
      </TabsContent>
      
      <TabsContent value="implementations" className="mt-6">
        <ImplementationsTabContent implementations={implementations} />
      </TabsContent>
      
      <TabsContent value="badges" className="mt-6">
        <AchievementGrid achievements={formattedAchievements} />
      </TabsContent>
    </Tabs>
  );
};
