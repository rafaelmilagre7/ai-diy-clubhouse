
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealAnalyticsOverview } from '@/components/admin/analytics/RealAnalyticsOverview';
import { OptimizedRealtimeStats } from '@/components/admin/analytics/OptimizedRealtimeStats';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/users/UserAnalyticsTabContent';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/tabs/LmsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Administrativo</h1>
          <p className="text-muted-foreground">
            Dados completos e em tempo real da plataforma
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas em Tempo Real</CardTitle>
          <CardDescription>
            Métricas atualizadas a cada 5 minutos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OptimizedRealtimeStats />
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="learning">Aprendizado</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RealAnalyticsOverview timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="users">
          <UserAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="solutions">
          <SolutionsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="learning">
          <LmsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="implementations">
          <ImplementationsAnalyticsTabContent timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
