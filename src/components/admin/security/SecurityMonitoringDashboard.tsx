import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Shield,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonitoringResult {
  monitoring_status: string;
  critical_issues: number;
  high_priority_issues: number;
  alert_triggered: boolean;
  scan_time: string;
  issues_detected: any[];
}

interface SecurityChanges {
  status?: string;
  message?: string;
  current_scan: {
    date: string;
    total_warnings: number;
    critical_warnings: number;
  };
  previous_scan: {
    date: string;
    total_warnings: number;
    critical_warnings: number;
  };
  changes: {
    total_change: number;
    critical_change: number;
    improvement_percentage: number;
  };
}

export const SecurityMonitoringDashboard = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Query para relatório de melhoria
  const { data: improvementReport, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['security-improvement-report'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('security_improvement_report');
      if (error) throw error;
      return data;
    },
  });

  // Query para histórico do linter
  const { data: linterHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['security-linter-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_linter_history')
        .select('*')
        .order('execution_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Função para executar monitoramento
  const runAutomatedMonitoring = async () => {
    setIsMonitoring(true);
    try {
      const { data, error } = await supabase.rpc('automated_security_monitor');
      if (error) throw error;
      
      const result = data as MonitoringResult;
      
      if (result.alert_triggered) {
        toast.warning(`Alerta de segurança! ${result.critical_issues} problemas críticos detectados`);
      } else {
        toast.success('Monitoramento concluído sem alertas críticos');
      }
      
      // Atualizar dados
      refetchReport();
      
      return result;
    } catch (error) {
      toast.error('Erro ao executar monitoramento automático');
      throw error;
    } finally {
      setIsMonitoring(false);
    }
  };

  // Query para mudanças de segurança
  const { data: securityChanges, refetch: refetchChanges } = useQuery({
    queryKey: ['security-changes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('detect_security_changes');
      if (error) throw error;
      return data as SecurityChanges;
    },
    enabled: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELENTE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACEITÁVEL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NECESSITA ATENÇÃO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento de Segurança</h2>
          <p className="text-muted-foreground">Sistema automatizado de monitoramento contínuo</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetchChanges()}
            variant="outline"
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Detectar Mudanças
          </Button>
          <Button
            onClick={runAutomatedMonitoring}
            disabled={isMonitoring}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Monitor className="w-4 h-4 mr-2 animate-spin" />
                Monitorando...
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 mr-2" />
                Executar Monitoramento
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Relatório de Melhoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Relatório de Progresso das Etapas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportLoading ? (
            <div className="text-center py-8">Carregando relatório de melhoria...</div>
          ) : improvementReport?.error ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{improvementReport.error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Status das Fases */}
              <div>
                <h4 className="font-medium mb-3">Fases Implementadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(improvementReport?.phases_completed || {}).map(([phase, completed]) => (
                    <div key={phase} className="flex items-center gap-2 p-3 border rounded-lg">
                      {completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">
                        {phase.replace(/_/g, ' ').replace(/phase (\d)/, 'Fase $1')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas de Melhoria */}
              <div>
                <h4 className="font-medium mb-3">Métricas de Melhoria</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-red-600">
                      {improvementReport?.improvement_metrics?.baseline_warnings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Warnings Inicial</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-green-600">
                      {improvementReport?.improvement_metrics?.current_warnings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Warnings Atual</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-blue-600">
                      {improvementReport?.improvement_metrics?.total_reduction || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Redução Total</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-purple-600">
                      {improvementReport?.improvement_metrics?.improvement_percentage || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Melhoria %</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <Badge className={getStatusColor(improvementReport?.improvement_metrics?.security_status)}>
                      {improvementReport?.improvement_metrics?.security_status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Status Geral</div>
                  </div>
                </div>
              </div>

              {/* Componentes Implementados */}
              <div>
                <h4 className="font-medium mb-3">Componentes de Segurança</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-green-600 mb-2">✓ Funções Seguras</div>
                    <div className="text-2xl font-bold">{improvementReport?.improvement_metrics?.functions_secured || 0}</div>
                    <div className="text-sm text-muted-foreground">Funções com search_path</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-blue-600 mb-2">✓ Políticas Endurecidas</div>
                    <div className="text-2xl font-bold">{improvementReport?.improvement_metrics?.policies_hardened || 0}</div>
                    <div className="text-sm text-muted-foreground">Políticas RLS seguras</div>
                  </div>
                </div>
              </div>

              {/* Recomendações */}
              <div>
                <h4 className="font-medium mb-3">Próximos Passos</h4>
                <div className="space-y-2">
                  {(improvementReport?.recommendations || []).map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mudanças de Segurança */}
      {securityChanges && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Mudanças</CardTitle>
          </CardHeader>
          <CardContent>
            {securityChanges.status === 'no_previous_data' ? (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>{securityChanges.message}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Scan Atual</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatDistanceToNow(new Date(securityChanges.current_scan.date), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Total de Warnings:</span>
                        <span className="font-medium">{securityChanges.current_scan.total_warnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Críticos:</span>
                        <span className="font-medium text-red-600">{securityChanges.current_scan.critical_warnings}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Mudanças</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Total:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(securityChanges.changes.total_change)}
                          <span className="font-medium">{securityChanges.changes.total_change}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Críticos:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(securityChanges.changes.critical_change)}
                          <span className="font-medium">{securityChanges.changes.critical_change}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Melhoria:</span>
                        <Badge variant={securityChanges.changes.improvement_percentage > 0 ? 'default' : 'secondary'}>
                          {securityChanges.changes.improvement_percentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico do Linter */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8">Carregando histórico...</div>
          ) : !linterHistory || linterHistory.length === 0 ? (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>Nenhum histórico de monitoramento disponível ainda.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {linterHistory.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(entry.execution_date), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.total_warnings} warnings total, {entry.critical_warnings} críticos
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.improvement_percentage && (
                      <Badge variant={entry.improvement_percentage > 0 ? 'default' : 'secondary'}>
                        {entry.improvement_percentage > 0 ? '+' : ''}{entry.improvement_percentage}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};