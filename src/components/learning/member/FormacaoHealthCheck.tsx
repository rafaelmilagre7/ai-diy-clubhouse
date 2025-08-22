import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Circle, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HealthStatus {
  apiStatus: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  responseTime: number;
  consecutiveFailures: number;
}

export const FormacaoHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    apiStatus: 'healthy',
    lastCheck: new Date(),
    responseTime: 0,
    consecutiveFailures: 0
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Função para verificar a saúde da API
  const checkAPIHealth = async (): Promise<HealthStatus> => {
    const startTime = performance.now();
    
    try {
      console.log('[FORMACAO_HEALTH] Iniciando verificação de saúde da API...');
      
      // Teste rápido de conectividade com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase
        .from('learning_courses')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (error) {
        console.error('[FORMACAO_HEALTH] Erro na verificação:', error);
        return {
          apiStatus: 'down',
          lastCheck: new Date(),
          responseTime,
          consecutiveFailures: healthStatus.consecutiveFailures + 1
        };
      }
      
      // Determinar status baseado no tempo de resposta
      let status: 'healthy' | 'degraded' | 'down' = 'healthy';
      if (responseTime > 3000) {
        status = 'degraded';
      } else if (responseTime > 5000) {
        status = 'down';
      }
      
      console.log(`[FORMACAO_HEALTH] Verificação concluída - Status: ${status}, Tempo: ${responseTime}ms`);
      
      return {
        apiStatus: status,
        lastCheck: new Date(),
        responseTime,
        consecutiveFailures: 0
      };
      
    } catch (error) {
      console.error('[FORMACAO_HEALTH] Erro crítico na verificação:', error);
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      return {
        apiStatus: 'down',
        lastCheck: new Date(),
        responseTime,
        consecutiveFailures: healthStatus.consecutiveFailures + 1
      };
    }
  };

  // Verificação manual
  const handleManualCheck = async () => {
    setIsChecking(true);
    const newStatus = await checkAPIHealth();
    setHealthStatus(newStatus);
    setIsChecking(false);
  };

  // Verificação automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isChecking) {
        const newStatus = await checkAPIHealth();
        setHealthStatus(newStatus);
      }
    }, 30000);

    // Verificação inicial
    checkAPIHealth().then(setHealthStatus);

    return () => clearInterval(interval);
  }, [isChecking]);

  const getStatusIcon = () => {
    switch (healthStatus.apiStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <Circle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (healthStatus.apiStatus) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sistema OK</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Lentidão</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Indisponível</Badge>;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms > 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  // Mostrar apenas se houver problemas ou se o usuário quiser ver detalhes
  const shouldShow = healthStatus.apiStatus !== 'healthy' || showDetails;

  if (!shouldShow) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border"
      >
        {getStatusIcon()}
        <span className="ml-2 text-xs">Status</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 min-w-[280px] bg-background/95 backdrop-blur-sm border shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">API Formação</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Tempo de resposta:</span>
            <span className={healthStatus.responseTime > 2000 ? 'text-yellow-600' : 'text-green-600'}>
              {formatResponseTime(healthStatus.responseTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Última verificação:</span>
            <span>{healthStatus.lastCheck.toLocaleTimeString()}</span>
          </div>
          
          {healthStatus.consecutiveFailures > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Falhas consecutivas:</span>
              <span>{healthStatus.consecutiveFailures}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex-1 h-7 text-xs"
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Verificar
          </Button>
          
          {healthStatus.apiStatus !== 'healthy' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1 h-7 text-xs"
            >
              Recarregar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};