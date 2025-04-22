
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';

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
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <PlaceholderTabContent title="Análise de Usuários" />
        </TabsContent>
        
        <TabsContent value="solutions" className="space-y-4">
          <PlaceholderTabContent title="Análise de Soluções" />
        </TabsContent>
        
        <TabsContent value="implementations" className="space-y-4">
          <PlaceholderTabContent title="Análise de Implementações" />
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <PlaceholderTabContent title="Análise de Engajamento" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
