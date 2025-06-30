
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TransitionWrapper } from './components/TransitionWrapper';
import { useOptimizedAnalyticsData } from '@/hooks/analytics/useOptimizedAnalyticsData';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';

interface RealAnalyticsOverviewProps {
  data?: any;
  loading?: boolean;
  error?: any;
}

export const RealAnalyticsOverview = ({ 
  data: fallbackData, 
  loading: fallbackLoading, 
  error: fallbackError 
}: RealAnalyticsOverviewProps) => {
  // Usar hook otimizado com fallback
  const {
    data: optimizedData,
    loading: optimizedLoading,
    error: optimizedError,
    metadata
  } = useOptimizedAnalyticsData({
    timeRange: '30d',
    enableCache: true,
    debounceDelay: 300
  });

  // Hook original como fallback
  const {
    data: originalData,
    loading: originalLoading,
    error: originalError
  } = useAnalyticsData({
    timeRange: '30d'
  });

  // Determinar qual dados usar
  const data = optimizedData || fallbackData || originalData;
  const loading = optimizedLoading || fallbackLoading || originalLoading;
  const error = optimizedError || fallbackError || originalError;

  // Log de performance se disponível
  if (metadata?.fromCache) {
    console.log('📊 [Analytics] Dados carregados do cache:', metadata.filterHash);
  }

  if (loading) {
    return (
      <TransitionWrapper isLoading={true}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted animate-pulse rounded-lg" />
            <div className="h-80 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </TransitionWrapper>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return (
      <TransitionWrapper>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de analytics: {errorMessage}
          </AlertDescription>
        </Alert>
      </TransitionWrapper>
    );
  }

  if (!data) {
    return (
      <TransitionWrapper>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum dado de analytics disponível no momento.
          </AlertDescription>
        </Alert>
      </TransitionWrapper>
    );
  }

  return (
    <TransitionWrapper>
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total de Usuários</h3>
            <p className="text-2xl font-bold text-gray-900">{data.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Soluções Ativas</h3>
            <p className="text-2xl font-bold text-gray-900">{data.totalSolutions || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Implementações</h3>
            <p className="text-2xl font-bold text-gray-900">{data.totalImplementations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Taxa de Conclusão</h3>
            <p className="text-2xl font-bold text-gray-900">{data.completionRate || 0}%</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Crescimento de Usuários</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {data.usersByTime?.length > 0 ? (
                <span>Gráfico de crescimento (dados disponíveis)</span>
              ) : (
                <span>Aguardando dados de usuários</span>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Soluções Populares</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {data.solutionPopularity?.length > 0 ? (
                <span>Gráfico de popularidade (dados disponíveis)</span>
              ) : (
                <span>Aguardando dados de soluções</span>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de Performance */}
        {metadata && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <span className="font-medium">Performance:</span> 
            {metadata.fromCache && <span className="text-green-600 ml-2">Cache Hit ✓</span>}
            {metadata.queryTime && <span className="ml-2">Tempo: {metadata.queryTime}ms</span>}
          </div>
        )}
      </div>
    </TransitionWrapper>
  );
};
