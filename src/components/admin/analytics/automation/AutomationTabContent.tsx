
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { AutoRecommendations } from './AutoRecommendations';
import { OperationalCommand } from './OperationalCommand';
import { PredictiveAnalytics } from './PredictiveAnalytics';

interface AutomationTabContentProps {
  timeRange: string;
}

export const AutomationTabContent: React.FC<AutomationTabContentProps> = ({ timeRange }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 backdrop-blur-sm rounded-xl p-1">
          <TabsTrigger 
            value="executive"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Dashboard Executivo
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Recomendações IA
          </TabsTrigger>
          <TabsTrigger 
            value="predictive"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Analytics Preditivos
          </TabsTrigger>
          <TabsTrigger 
            value="command"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Centro de Comando
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="executive" className="mt-0">
            <ExecutiveDashboard timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0">
            <AutoRecommendations timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="predictive" className="mt-0">
            <PredictiveAnalytics timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="command" className="mt-0">
            <OperationalCommand timeRange={timeRange} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
