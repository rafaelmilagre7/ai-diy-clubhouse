
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Solution, Progress } from '@/types/solution';
import { SolutionOverviewTab } from './SolutionOverviewTab';
import { SolutionImplementationTab } from './SolutionImplementationTab';
import { SolutionResourcesTab } from './SolutionResourcesTab';
import { SolutionCommentsTab } from './SolutionCommentsTab';

interface SolutionTabsContentProps {
  solution: Solution;
  progress: Progress | null;
}

const SolutionTabsContent: React.FC<SolutionTabsContentProps> = ({ solution, progress }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="implementation">Implementação</TabsTrigger>
        <TabsTrigger value="resources">Recursos</TabsTrigger>
        <TabsTrigger value="comments">Comentários</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <SolutionOverviewTab solution={solution} />
      </TabsContent>
      
      <TabsContent value="implementation">
        <SolutionImplementationTab solution={solution} progress={progress} />
      </TabsContent>
      
      <TabsContent value="resources">
        <SolutionResourcesTab solution={solution} />
      </TabsContent>
      
      <TabsContent value="comments">
        <SolutionCommentsTab solution={solution} />
      </TabsContent>
    </Tabs>
  );
};

export default SolutionTabsContent;
