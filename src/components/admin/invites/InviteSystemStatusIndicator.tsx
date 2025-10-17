/**
 * Componente para mostrar status de otimização do sistema de convites
 */

import React from 'react';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInvitePerformanceOptimizer } from '@/hooks/admin/invites/useInvitePerformanceOptimizer';

interface InviteSystemStatusIndicatorProps {
  className?: string;
}

export const InviteSystemStatusIndicator: React.FC<InviteSystemStatusIndicatorProps> = ({ 
  className = '' 
}) => {
  const { metrics, isOptimizing, forceOptimization, isReady } = useInvitePerformanceOptimizer();

  const getStatusConfig = () => {
    switch (metrics.warmupStatus) {
      case 'ready':
        return {
          icon: CheckCircle,
          color: 'bg-system-healthy',
          textColor: 'text-system-healthy',
          badge: 'success',
          label: 'Sistema Otimizado',
          description: `Performance ideal • ${metrics.averageInviteTime}ms médio`
        };
      case 'warming':
        return {
          icon: Clock,
          color: 'bg-status-warning',
          textColor: 'text-status-warning',
          badge: 'default',
          label: 'Otimizando...',
          description: 'Aquecendo edge functions'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'bg-status-error',
          textColor: 'text-status-error',
          badge: 'destructive',
          label: 'Sistema Lento',
          description: 'Otimização falhou • Performance pode estar reduzida'
        };
      default:
        return {
          icon: Zap,
          color: 'bg-muted',
          textColor: 'text-muted-foreground',
          badge: 'secondary',
          label: 'Não Otimizado',
          description: 'Clique para otimizar performance'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {/* Indicador visual */}
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                {metrics.warmupStatus === 'warming' && (
                  <div className={`absolute top-0 left-0 w-3 h-3 rounded-full ${statusConfig.color} animate-pulse`} />
                )}
              </div>

              {/* Badge de status */}
              <Badge 
                variant={statusConfig.badge as any} 
                className="text-xs"
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>

              {/* Métrica de performance quando disponível */}
              {metrics.averageInviteTime > 0 && isReady && (
                <span className="text-xs text-muted-foreground">
                  {metrics.averageInviteTime}ms
                </span>
              )}
            </div>
          </TooltipTrigger>
          
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{statusConfig.label}</p>
              <p className="text-muted-foreground">{statusConfig.description}</p>
              {metrics.lastWarmup && (
                <p className="text-xs text-muted-foreground mt-1">
                  Último aquecimento: {metrics.lastWarmup.toLocaleTimeString()}
                </p>
              )}
              {metrics.successRate < 100 && (
                <p className="text-xs text-status-warning">
                  Taxa de sucesso: {metrics.successRate.toFixed(1)}%
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Botão de otimização manual quando necessário */}
      {!isReady && !isOptimizing && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={forceOptimization}
          className="text-xs h-6 px-2"
          disabled={isOptimizing}
        >
          <Zap className="w-3 h-3 mr-1" />
          Otimizar
        </Button>
      )}
    </div>
  );
};

export default InviteSystemStatusIndicator;