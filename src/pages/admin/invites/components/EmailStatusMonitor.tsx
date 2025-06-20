
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Zap,
  Mail,
  Heart,
  Activity,
  Clock
} from 'lucide-react';
import { useEmailSystemMonitor } from '@/hooks/admin/email/useEmailSystemMonitor';

export const EmailStatusMonitor: React.FC = () => {
  const {
    metrics,
    isMonitoring,
    performHealthCheck
  } = useEmailSystemMonitor();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Status do Sistema de Email
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(metrics.status)}
              <Badge 
                variant={metrics.status === 'healthy' ? 'default' : 'destructive'}
                className={metrics.status === 'healthy' ? 'bg-green-500' : ''}
              >
                {metrics.status === 'healthy' ? 'Sistema Operacional' : 
                 metrics.status === 'degraded' ? 'Performance Degradada' : 
                 'Sistema Indisponível'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tempo de Resposta */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {metrics.responseTime}ms
              </div>
              <div className="text-sm text-blue-700">Tempo de Resposta</div>
            </div>

            {/* Taxa de Sucesso */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {metrics.successRate}%
              </div>
              <div className="text-sm text-green-700">Taxa de Sucesso</div>
            </div>

            {/* Erros Recentes */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {metrics.errorCount}
              </div>
              <div className="text-sm text-red-700">Erros (24h)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Monitoramento Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status do Monitoramento:</span>
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Última Verificação:</span>
              <span className="text-sm text-muted-foreground">
                {metrics.lastCheck.toLocaleTimeString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Frequência:</span>
              <span className="text-sm text-muted-foreground">A cada 2 minutos</span>
            </div>
            
            <Button 
              onClick={performHealthCheck}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Agora
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Sistema de Recuperação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm">Fallback Automático</span>
                <Badge variant="outline" className="text-xs">Ativo</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Retry Exponencial</span>
                <Badge variant="outline" className="text-xs">3x</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Supabase Auth Backup</span>
                <Badge variant="outline" className="text-xs">Disponível</Badge>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-3 p-2 bg-gray-50 rounded">
              Sistema configurado para 95%+ de taxa de entrega com múltiplas camadas de fallback.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erros Recentes */}
      {metrics.recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Erros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentErrors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800"
                >
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-green-900">🔧 Configuração Atual</h4>
              <p className="text-green-700">Resend Pro + Templates React Email</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">⚡ Performance</h4>
              <p className="text-blue-700">Timeout 30s + Retry Automático</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-purple-900">🛡️ Confiabilidade</h4>
              <p className="text-purple-700">3 Camadas de Fallback + Logs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
