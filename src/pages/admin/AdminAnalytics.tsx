
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { AnalyticsFilters } from '@/components/admin/analytics/AnalyticsFilters';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';
import { RealtimeStats } from '@/components/admin/analytics/RealtimeStats';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  const filters = { timeRange, category, difficulty };
  const { data, loading } = useAnalyticsData(filters);

  return (
    <div className="space-y-6">
      <AnalyticsHeader timeRange={timeRange} setTimeRange={setTimeRange} />
      
      <AnalyticsFilters 
        timeRange={timeRange} 
        setTimeRange={setTimeRange}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      
      <RealtimeStats />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewTabContent loading={loading} data={data} />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <PlaceholderTabContent 
            title="Análise de Usuários"
            description="Análises detalhadas sobre o comportamento dos usuários serão disponibilizadas em breve."
            badges={[
              "Tempo médio de uso",
              "Análise de coorte",
              "Retenção de usuários",
              "Segmentação",
              "Jornada do usuário"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="solutions" className="mt-6">
          <PlaceholderTabContent 
            title="Análise de Soluções"
            description="Análises detalhadas de cada solução estão disponíveis na página de métricas da solução."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
