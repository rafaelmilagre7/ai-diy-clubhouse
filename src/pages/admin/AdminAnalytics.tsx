
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/lms/LmsAnalyticsTabContent';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/users/UserAnalyticsTabContent';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const { toast } = useToast();
  
  // Buscar dados de análise para a visão geral
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refresh: refreshAnalytics 
  } = useAnalyticsData({
    timeRange,
    category,
    difficulty
  });

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };

  const handleRefresh = useCallback(() => {
    toast({
      title: "Atualizando dados",
      description: "Os dados estão sendo atualizados...",
    });
    refreshAnalytics();
  }, [refreshAnalytics, toast]);

  return (
    <PermissionGuard 
      permission="analytics.view"
      fallback={
        <Alert variant="destructive" className="max-w-4xl mx-auto my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar os dados de analytics.
            Entre em contato com um administrador se precisar de acesso a este recurso.
          </AlertDescription>
        </Alert>
      }
    >
      {/* Background com gradiente */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="relative">
          {/* Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-12">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Analytics Avançado</h1>
                    <p className="text-blue-100 text-lg">
                      Insights completos da sua plataforma VIVER DE IA
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="secondary"
                  size="lg"
                  onClick={handleRefresh}
                  disabled={analyticsLoading}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
                      <p className="text-3xl font-bold text-white">1,247</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
                        <span className="text-green-300 text-sm">+12% vs mês anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/30 rounded-xl">
                      <Activity className="h-6 w-6 text-blue-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Receita do Mês</p>
                      <p className="text-3xl font-bold text-white">R$ 45.2K</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
                        <span className="text-green-300 text-sm">+8% vs mês anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-500/30 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-purple-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Taxa de Conversão</p>
                      <p className="text-3xl font-bold text-white">24.5%</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
                        <span className="text-green-300 text-sm">+3.2% vs mês anterior</span>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-500/30 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-indigo-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Filters Card */}
            <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardContent className="pt-6">
                <AnalyticsHeader 
                  timeRange={timeRange}
                  setTimeRange={handleTimeRangeChange}
                  category={category}
                  setCategory={handleCategoryChange}
                  difficulty={difficulty}
                  setDifficulty={handleDifficultyChange}
                />
              </CardContent>
            </Card>

            {analyticsError && (
              <Alert variant="destructive" className="mb-8 border-0 shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao carregar dados</AlertTitle>
                <AlertDescription>{analyticsError}</AlertDescription>
              </Alert>
            )}

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 p-2 rounded-2xl border-0 shadow-xl">
                <TabsList className="grid grid-cols-6 max-w-full gap-2 bg-transparent">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lms" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    LMS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solutions" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    Soluções
                  </TabsTrigger>
                  <TabsTrigger 
                    value="implementations" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    Implementações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="engagement" 
                    className="rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
                  >
                    Engajamento
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <OverviewTabContent 
                  timeRange={timeRange} 
                  loading={analyticsLoading} 
                  data={analyticsData} 
                  onRefresh={handleRefresh} 
                />
              </TabsContent>
              
              <TabsContent value="lms" className="space-y-6">
                <LmsAnalyticsTabContent timeRange={timeRange} />
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6">
                <UserAnalyticsTabContent timeRange={timeRange} />
              </TabsContent>
              
              <TabsContent value="solutions" className="space-y-6">
                <SolutionsAnalyticsTabContent timeRange={timeRange} />
              </TabsContent>
              
              <TabsContent value="implementations" className="space-y-6">
                <ImplementationsAnalyticsTabContent timeRange={timeRange} />
              </TabsContent>
              
              <TabsContent value="engagement" className="space-y-6">
                <PlaceholderTabContent 
                  title="Análise de Engajamento" 
                  description="Métricas de interação e atividade dos usuários na plataforma."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AdminAnalytics;
