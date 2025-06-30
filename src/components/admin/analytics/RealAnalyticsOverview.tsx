
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, TrendingUp, Users, Target, BookOpen } from 'lucide-react';
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
    category: 'all',
    difficulty: 'all',
    searchTerm: '',
    enableCache: true,
    debounceDelay: 300
  });

  // Hook original como fallback - com todas as propriedades necessárias
  const {
    data: originalData,
    loading: originalLoading,
    error: originalError
  } = useAnalyticsData({
    timeRange: '30d',
    category: 'all',
    difficulty: 'all'
  });

  // Determinar qual dados usar com prioridade para fallbackData (dados reais)
  const data = fallbackData || optimizedData || originalData;
  const loading = fallbackLoading || optimizedLoading || originalLoading;
  const error = fallbackError || optimizedError || originalError;

  // Log de performance se disponível
  if (metadata?.fromCache) {
    console.log('📊 [Analytics] Dados carregados do cache:', metadata.filterHash);
  }

  // Debug dos dados recebidos
  React.useEffect(() => {
    console.log('🔍 [Analytics Overview] Debug dos dados:', {
      fallbackData: !!fallbackData,
      optimizedData: !!optimizedData,
      originalData: !!originalData,
      finalData: !!data,
      loading,
      error: !!error
    });
  }, [fallbackData, optimizedData, originalData, data, loading, error]);

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
            Nenhum dado de analytics disponível no momento. Tentando carregar dados...
          </AlertDescription>
        </Alert>
      </TransitionWrapper>
    );
  }

  // Função para garantir valores numéricos válidos
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  return (
    <TransitionWrapper>
      <div className="space-y-6">
        {/* Status de Carregamento dos Dados */}
        {data && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Dados carregados com sucesso! 
              {metadata?.fromCache && " (Cache)"}
              {data.totalUsers && ` • ${data.totalUsers} usuários encontrados`}
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Usuários</h3>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {safeNumber(data.totalUsers).toLocaleString()}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  +{safeNumber(data.newUsers30d)} novos (30d)
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Soluções Ativas</h3>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {safeNumber(data.totalSolutions).toLocaleString()}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {safeNumber(data.completedImplementations)} implementadas
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Implementações</h3>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {safeNumber(data.completedImplementations).toLocaleString()}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {safeNumber(data.activeImplementations)} em andamento
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Taxa de Conclusão</h3>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {safeNumber(data.completionRate || data.overallCompletionRate, 0).toFixed(1)}%
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  Meta: 70%
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Crescimento de Usuários</h3>
            <div className="h-64 flex items-center justify-center">
              {data.usersByTime?.length > 0 || data.userGrowthData?.length > 0 ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    📈 {safeNumber(data.totalUsers)} usuários
                  </div>
                  <p className="text-gray-500 mt-2">
                    Dados disponíveis ({(data.usersByTime?.length || data.userGrowthData?.length || 0)} pontos)
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <span>Aguardando dados de usuários</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Soluções Populares</h3>
            <div className="h-64 flex items-center justify-center">
              {data.solutionPopularity?.length > 0 || data.solutionPerformance?.length > 0 ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    🎯 {safeNumber(data.totalSolutions)} soluções
                  </div>
                  <p className="text-gray-500 mt-2">
                    Dados disponíveis ({(data.solutionPopularity?.length || data.solutionPerformance?.length || 0)} itens)
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <span>Aguardando dados de soluções</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de Performance */}
        {metadata && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Performance do Sistema:</span>
              <div className="flex items-center space-x-4">
                {metadata.fromCache && (
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                    ⚡ Cache Hit
                  </span>
                )}
                {metadata.queryTime && (
                  <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
                    ⏱️ {metadata.queryTime}ms
                  </span>
                )}
                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  🔄 Dados atualizados
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TransitionWrapper>
  );
};
