
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Clock,
  Eye,
  Lock
} from 'lucide-react';
import { rateLimit } from '@/utils/intelligentRateLimit'; // CORREÇÃO: importação correta

interface SecurityMetrics {
  totalThreats: number;
  blockedAttacks: number;
  activeMonitoring: boolean;
  rateLimit: number;
  lastUpdate: Date;
}

export const SecurityMetricsWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalThreats: 0,
    blockedAttacks: 0,
    activeMonitoring: true,
    rateLimit: 85,
    lastUpdate: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);

  // Rate limiting para atualizações de métricas
  const metricsRateLimit = rateLimit({
    windowMs: 5 * 1000, // 5 segundos
    max: 1, // máximo 1 atualização a cada 5 segundos
    message: 'Rate limit para métricas de segurança',
    statusCode: 429
  });

  useEffect(() => {
    const updateMetrics = () => {
      // SEGURANÇA: Rate limiting para atualizações
      const rateLimitResult = metricsRateLimit('security_metrics');
      if (!rateLimitResult.success) {
        return;
      }

      // Simular métricas em tempo real
      setMetrics(prev => ({
        ...prev,
        totalThreats: Math.floor(Math.random() * 50),
        blockedAttacks: Math.floor(Math.random() * 20),
        rateLimit: Math.max(60, Math.min(100, prev.rateLimit + (Math.random() - 0.5) * 10)),
        lastUpdate: new Date()
      }));
      
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Atualizar a cada 10 segundos

    return () => clearInterval(interval);
  }, [metricsRateLimit]);

  const getThreatLevel = (count: number): { level: string; color: string } => {
    if (count === 0) return { level: 'SEGURO', color: 'bg-green-500' };
    if (count < 10) return { level: 'BAIXO', color: 'bg-yellow-500' };
    if (count < 25) return { level: 'MÉDIO', color: 'bg-orange-500' };
    return { level: 'ALTO', color: 'bg-red-500' };
  };

  const threatInfo = getThreatLevel(metrics.totalThreats);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Métricas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Métricas de Segurança
        </CardTitle>
        <CardDescription>
          Monitoramento em tempo real de ameaças e proteções
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status de Monitoramento */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Monitoramento Ativo</span>
          </div>
          <Badge variant={metrics.activeMonitoring ? "default" : "destructive"}>
            {metrics.activeMonitoring ? "ATIVO" : "INATIVO"}
          </Badge>
        </div>

        {/* Nível de Ameaça */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nível de Ameaça</span>
            <Badge variant="outline" className={`${threatInfo.color} text-white`}>
              {threatInfo.level}
            </Badge>
          </div>
          <div className="text-2xl font-bold">{metrics.totalThreats}</div>
          <p className="text-xs text-muted-foreground">
            Ameaças detectadas nas últimas 24h
          </p>
        </div>

        {/* Ataques Bloqueados */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Ataques Bloqueados</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{metrics.blockedAttacks}</div>
          <p className="text-xs text-muted-foreground">
            Tentativas maliciosas impedidas
          </p>
        </div>

        {/* Rate Limit Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rate Limit</span>
            <span className="text-sm text-muted-foreground">{metrics.rateLimit}%</span>
          </div>
          <Progress value={metrics.rateLimit} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Capacidade de proteção atual
          </p>
        </div>

        {/* Última Atualização */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
          <Clock className="h-3 w-3" />
          <span>
            Última atualização: {metrics.lastUpdate.toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
