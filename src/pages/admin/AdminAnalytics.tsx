
import React, { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';
import { AnalyticsFilters } from '@/components/admin/analytics/AnalyticsFilters';
import { RealtimeStats } from '@/components/admin/analytics/RealtimeStats';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  const filters = { timeRange, category, difficulty };
  
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      
      {/* Estatísticas em tempo real */}
      <ErrorBoundary
        fallback={
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>Não foi possível carregar estatísticas em tempo real</p>
            </div>
          </div>
        }
      >
        <Suspense fallback={<div className="h-24 w-full bg-muted animate-pulse rounded-md" />}>
          <RealtimeStats />
        </Suspense>
      </ErrorBoundary>

      {/* Filtros */}
      <AnalyticsFilters 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="w-full sm:w-auto flex overflow-x-auto pb-px">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>
        
        <ErrorBoundary
          fallback={
            <div className="rounded-md border p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar os dados de análise para esta aba.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          }
        >
          <TabContent 
            activeTab={activeTab} 
            filters={filters} 
          />
        </ErrorBoundary>
      </Tabs>
    </div>
  );
};

// Componente separado para facilitar a suspensão e evitar re-renderizações
const TabContent = ({ 
  activeTab, 
  filters
}: { 
  activeTab: string;
  filters: { timeRange: string; category: string; difficulty: string };
}) => {
  const { data, isLoading, error } = useAnalyticsData(filters);

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h3 className="font-semibold text-lg mb-2">Erro ao carregar dados</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Ocorreu um erro ao carregar os dados.'}
        </p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <>
      <TabsContent value="overview" className="space-y-4">
        <OverviewTabContent 
          loading={isLoading} 
          data={data || {
            usersByTime: [],
            solutionPopularity: [],
            implementationsByCategory: [],
            userCompletionRate: [],
            dayOfWeekActivity: []
          }}
        />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <PlaceholderTabContent 
          title="Análise de Usuários" 
          description="Estatísticas e métricas detalhadas sobre os usuários da plataforma."
        />
      </TabsContent>
      
      <TabsContent value="solutions" className="space-y-4">
        <PlaceholderTabContent 
          title="Análise de Soluções" 
          description="Métricas de implementação e engajamento das soluções disponíveis."
        />
      </TabsContent>
      
      <TabsContent value="implementations" className="space-y-4">
        <PlaceholderTabContent 
          title="Análise de Implementações" 
          description="Estatísticas de progresso e conclusão das implementações."
        />
      </TabsContent>
      
      <TabsContent value="engagement" className="space-y-4">
        <PlaceholderTabContent 
          title="Análise de Engajamento" 
          description="Métricas de interação e atividade dos usuários na plataforma."
        />
      </TabsContent>
    </>
  );
};

export default AdminAnalytics;
