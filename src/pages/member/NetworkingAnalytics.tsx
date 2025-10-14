import React from 'react';
import { NetworkingHeader } from '@/components/networking/NetworkingHeader';
import { NetworkingStatsCards } from '@/components/networking/analytics/NetworkingStatsCards';
import { ConnectionsChart } from '@/components/networking/analytics/ConnectionsChart';
import { InteractionsChart } from '@/components/networking/analytics/InteractionsChart';
import { TopIndustriesCard } from '@/components/networking/analytics/TopIndustriesCard';
import { ROIMetrics } from '@/components/networking/analytics/ROIMetrics';
import { useNetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NetworkingAnalytics = () => {
  const navigate = useNavigate();
  const { data: analytics, isLoading, error } = useNetworkingAnalytics();

  useDynamicSEO({
    title: 'Analytics - Networking AI',
    description: 'Análise detalhada de métricas de networking, ROI e performance de conexões',
    keywords: 'analytics, métricas, networking, ROI, performance'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-8">
        <Alert className="border-destructive/50 bg-destructive/10 max-w-2xl mx-auto">
          <AlertDescription className="text-destructive">
            Erro ao carregar analytics. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/networking')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Métricas e insights de networking em tempo real
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NetworkingStatsCards analytics={analytics} />
        </motion.div>

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <ConnectionsChart analytics={analytics} />
          <InteractionsChart analytics={analytics} />
        </motion.div>

        {/* Bottom Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <ROIMetrics analytics={analytics} />
          </div>
          <TopIndustriesCard analytics={analytics} />
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✨ Insights Inteligentes
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/30">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-sm">Performance Excelente</p>
                <p className="text-xs text-muted-foreground">
                  Sua taxa de resposta está 32% acima da média da plataforma
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/30">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-sm">Crescimento Acelerado</p>
                <p className="text-xs text-muted-foreground">
                  Você está no caminho de atingir 50 conexões até o fim do mês
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/30">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-sm">Oportunidade Identificada</p>
                <p className="text-xs text-muted-foreground">
                  Há 8 novos matches de alto valor aguardando sua atenção
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NetworkingAnalytics;
