
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsFilters } from '@/components/admin/analytics/AnalyticsFilters';
import { ModernAnalyticsHeader } from '@/components/admin/analytics/ModernAnalyticsHeader';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/users/UserAnalyticsTabContent';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';
import { InsightsTabContent } from '@/components/admin/analytics/insights/InsightsTabContent';
import { AutomationTabContent } from '@/components/admin/analytics/automation/AutomationTabContent';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <ModernAnalyticsHeader />
      
      <AnalyticsFilters 
        timeRange={timeRange} 
        onTimeRangeChange={setTimeRange}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+12% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Soluções Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">+8% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Implementações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,205</div>
                <p className="text-xs text-muted-foreground">+25% em relação ao período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">+5% em relação ao período anterior</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="solutions">
          <SolutionsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="implementations">
          <ImplementationsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationTabContent timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
