
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealAnalyticsOverview } from '@/components/admin/analytics/RealAnalyticsOverview';
import { OptimizedRealtimeStats } from '@/components/admin/analytics/OptimizedRealtimeStats';
import { EnhancedUserAnalytics } from '@/components/admin/analytics/users/EnhancedUserAnalytics';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/tabs/LmsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-operational/10 to-strategy/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-revenue/10 to-viverblue/10 blur-3xl animate-blob animation-delay-2000" />
      
      <div className="relative space-y-8 p-6 md:p-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-operational/20 to-strategy/20 backdrop-blur-sm border border-operational/20">
                <TrendingUp className="h-8 w-8 text-operational" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-operational to-strategy bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Dados completos e em tempo real da plataforma
                </p>
              </div>
            </div>
            
            {/* Quick Analytics Preview */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg surface-elevated">
                <BarChart3 className="h-4 w-4 text-operational" />
                <span className="text-caption">Métricas</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg surface-elevated">
                <TrendingUp className="h-4 w-4 text-strategy" />
                <span className="text-caption">Insights</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg surface-elevated">
                <Activity className="h-4 w-4 text-revenue" />
                <span className="text-caption">Tempo Real</span>
              </div>
            </div>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 aurora-focus bg-card/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="surface-modal border-0 shadow-aurora">
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Real-time Stats Card */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-operational/10">
                <Activity className="h-5 w-5 text-operational" />
              </div>
              <div>
                <CardTitle className="text-heading-3">Estatísticas em Tempo Real</CardTitle>
                <CardDescription className="text-body-small">
                  Métricas atualizadas a cada 5 minutos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OptimizedRealtimeStats />
          </CardContent>
        </Card>

        {/* Enhanced Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 surface-elevated border-0 shadow-aurora p-1">
            <TabsTrigger value="overview" className="aurora-focus">Visão Geral</TabsTrigger>
            <TabsTrigger value="users" className="aurora-focus">Usuários</TabsTrigger>
            <TabsTrigger value="solutions" className="aurora-focus">Soluções</TabsTrigger>
            <TabsTrigger value="learning" className="aurora-focus">Aprendizado</TabsTrigger>
            <TabsTrigger value="implementations" className="aurora-focus">Implementações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RealAnalyticsOverview timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <EnhancedUserAnalytics timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="solutions" className="space-y-6">
            <SolutionsAnalyticsTabContent timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <LmsAnalyticsTabContent timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="implementations" className="space-y-6">
            <ImplementationsAnalyticsTabContent timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
