
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResendHealthCheck } from "@/hooks/supabase/useResendHealthCheck";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  RefreshCw
} from "lucide-react";

export const EmailStatusMonitor = () => {
  const { status, isChecking, checkHealth } = useResendHealthCheck();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Verificação inicial
    checkHealth();
    
    // Atualização automática a cada 30 segundos
    const interval = setInterval(() => {
      checkHealth();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusColor = (healthy: boolean) => {
    return healthy ? "text-green-500" : "text-red-500";
  };

  const getStatusIcon = (healthy: boolean) => {
    return healthy ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const formatUptime = (responseTime: number) => {
    return responseTime < 1000 ? "Excelente" : responseTime < 3000 ? "Bom" : "Lento";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Status do Sistema de Email</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.isHealthy)}
              <div className="text-2xl font-bold">
                {status.isHealthy ? "Operacional" : "Indisponível"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema de envio de emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Resend</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.apiKeyValid)}
              <div className="text-2xl font-bold">
                {status.apiKeyValid ? "Válida" : "Inválida"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Chave de API configurada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {status.connectivity === 'connected' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <div className="text-2xl font-bold capitalize">
                {status.connectivity === 'connected' ? 'Conectado' : 'Desconectado'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Conexão com serviços externos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.responseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Performance: {formatUptime(status.responseTime)}
            </p>
          </CardContent>
        </Card>
      </div>

      {status.issues && status.issues.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Problemas Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {status.issues.map((issue, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-center gap-2">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Última verificação:</span>
              <p className="text-muted-foreground">{status.lastChecked.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium">Domínio válido:</span>
              <p className="text-muted-foreground">
                {status.domainValid ? "✅ Sim" : "❌ Não"}
              </p>
            </div>
          </div>
          
          {status.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <span className="font-medium text-red-800">Último erro:</span>
              <p className="text-red-700 text-sm mt-1">{status.lastError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
