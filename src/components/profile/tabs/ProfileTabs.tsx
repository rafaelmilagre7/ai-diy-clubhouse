
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CheckCircle } from "lucide-react";
import { StatsTabContent } from "./StatsTabContent";
import { ImplementationsTabContent } from "./ImplementationsTabContent";
import { Implementation } from "@/hooks/useProfileData";
import { UserStats } from "@/hooks/useUserStats/types";

interface ProfileTabsProps {
  defaultTab: string;
  implementations: Implementation[];
  stats: UserStats;
}

export const ProfileTabs = ({ 
  defaultTab, 
  implementations, 
  stats 
}: ProfileTabsProps) => {
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
      </TabsList>
      
      <TabsContent value="stats" className="mt-6">
        <StatsTabContent stats={stats} implementations={implementations} />
      </TabsContent>
      
      <TabsContent value="implementations" className="mt-6">
        <ImplementationsTabContent implementations={implementations} />
      </TabsContent>
    </Tabs>
  );
};
