
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/lms/LmsAnalyticsTabContent';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/users/UserAnalyticsTabContent';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="lms">LMS</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="lms" className="space-y-4">
          <LmsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="solutions" className="space-y-4">
          <SolutionsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="implementations" className="space-y-4">
          <ImplementationsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <PlaceholderTabContent 
            title="Análise de Engajamento" 
            description="Métricas de interação e atividade dos usuários na plataforma."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
