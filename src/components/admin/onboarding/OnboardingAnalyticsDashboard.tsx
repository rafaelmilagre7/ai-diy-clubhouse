
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingOverviewSection } from './OnboardingOverviewSection';
import { MarketInsightsSection } from './MarketInsightsSection';
import { UserPreferencesSection } from './UserPreferencesSection';
import { SalesOpportunitiesSection } from './SalesOpportunitiesSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOnboardingAnalytics, OnboardingTimeRange } from '@/hooks/admin/useOnboardingAnalytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info } from 'lucide-react';

export const OnboardingAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<OnboardingTimeRange>('all');
  const { loading, error, data } = useOnboardingAnalytics(timeRange);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as OnboardingTimeRange);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados de análise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Erro ao carregar dados de análise</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Análise de Onboarding</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.stats.totalUsers === 0 ? (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Sem dados suficientes</AlertTitle>
          <AlertDescription className="text-blue-600">
            Ainda não há dados de onboarding suficientes para gerar análises para o período selecionado.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="market-insights">Insights de Mercado</TabsTrigger>
            <TabsTrigger value="preferences">Preferências de Usuário</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades de Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OnboardingOverviewSection data={data} />
          </TabsContent>

          <TabsContent value="market-insights" className="space-y-6">
            <MarketInsightsSection data={data} />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <UserPreferencesSection data={data} />
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <SalesOpportunitiesSection data={data} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
