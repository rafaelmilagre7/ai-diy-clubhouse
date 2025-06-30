
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealAnalyticsOverview } from '@/components/admin/analytics/RealAnalyticsOverview';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';
import { useRealAdminAnalytics } from '@/hooks/admin/useRealAdminAnalytics';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();
  
  // Usar o hook de analytics real
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refresh: refreshAnalytics 
  } = useRealAdminAnalytics(timeRange);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
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
      <div className="space-y-6 p-6">
        {/* Header melhorado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Analytics Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral completa dos dados da plataforma em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={analyticsLoading}
              className="text-neutral-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filtros de período */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardContent className="pt-6">
            <AnalyticsHeader 
              timeRange={timeRange}
              setTimeRange={handleTimeRangeChange}
              category="all"
              setCategory={() => {}}
              difficulty="all"
              setDifficulty={() => {}}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <TabsList className="grid grid-cols-4 max-w-2xl gap-1 bg-gray-50 dark:bg-gray-800">
              <TabsTrigger 
                value="overview" 
                className="text-neutral-700 dark:text-gray-300 data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="text-neutral-700 dark:text-gray-300 data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Usuários
              </TabsTrigger>
              <TabsTrigger 
                value="solutions" 
                className="text-neutral-700 dark:text-gray-300 data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Soluções
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="text-neutral-700 dark:text-gray-300 data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Aprendizado
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-4">
            <RealAnalyticsOverview 
              data={analyticsData}
              loading={analyticsLoading} 
              error={analyticsError}
            />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <PlaceholderTabContent 
              title="Análise Detalhada de Usuários" 
              description="Métricas específicas sobre o comportamento e engajamento dos usuários."
            />
          </TabsContent>
          
          <TabsContent value="solutions" className="space-y-4">
            <PlaceholderTabContent 
              title="Performance de Soluções" 
              description="Análise detalhada da performance e adoção das soluções disponíveis."
            />
          </TabsContent>
          
          <TabsContent value="learning" className="space-y-4">
            <PlaceholderTabContent 
              title="Analytics de Aprendizado" 
              description="Métricas sobre o progresso e engajamento nos cursos e aulas."
            />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default AdminAnalytics;
