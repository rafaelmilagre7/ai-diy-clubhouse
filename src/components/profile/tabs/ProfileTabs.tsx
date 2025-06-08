
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CheckCircle, User } from "lucide-react";
import { StatsTabContent } from "./StatsTabContent";
import { ImplementationsTabContent } from "./ImplementationsTabContent";
import { CompleteProfileTabContent } from "./CompleteProfileTabContent";
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
    <Tabs defaultValue={defaultTab} className="animate-fade-in">
      <TabsList className="w-full">
        <TabsTrigger value="stats" className="flex-1">
          <BarChart className="mr-2 h-4 w-4" />
          Estatísticas
        </TabsTrigger>
        <TabsTrigger value="implementations" className="flex-1">
          <CheckCircle className="mr-2 h-4 w-4" />
          Implementações
        </TabsTrigger>
        <TabsTrigger value="complete-profile" className="flex-1">
          <User className="mr-2 h-4 w-4" />
          Perfil Completo
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats" className="mt-6">
        <StatsTabContent stats={stats} implementations={implementations} />
      </TabsContent>
      
      <TabsContent value="implementations" className="mt-6">
        <ImplementationsTabContent implementations={implementations} />
      </TabsContent>

      <TabsContent value="complete-profile" className="mt-6">
        <CompleteProfileTabContent />
      </TabsContent>
    </Tabs>
  );
};
