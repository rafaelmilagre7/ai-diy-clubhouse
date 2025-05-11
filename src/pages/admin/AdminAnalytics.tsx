
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
import { AlertCircle, RefreshCw } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={analyticsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Atualizar dados
          </Button>
        </div>

        <AnalyticsHeader 
          timeRange={timeRange}
          setTimeRange={handleTimeRangeChange}
          category={category}
          setCategory={handleCategoryChange}
          difficulty={difficulty}
          setDifficulty={handleDifficultyChange}
        />

        {analyticsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>{analyticsError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-6 max-w-4xl">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="lms">LMS</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="solutions">Soluções</TabsTrigger>
            <TabsTrigger value="implementations">Implementações</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OverviewTabContent 
              timeRange={timeRange} 
              loading={analyticsLoading} 
              data={analyticsData} 
              onRefresh={handleRefresh} 
            />
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
    </PermissionGuard>
  );
};

export default AdminAnalytics;
