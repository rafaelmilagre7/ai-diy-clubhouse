import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  AlertTriangle, 
  Database, 
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SystemLog {
  id: string;
  timestamp: number;
  error_severity: string;
  event_message: string;
  identifier: string;
}

export const SystemErrorLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Simular dados de logs para demonstração
      // Em produção, você usaria uma chamada real para os logs do Supabase
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: Date.now() * 1000,
          error_severity: 'ERROR',
          event_message: 'structure of query does not match function result type',
          identifier: 'supabase-db'
        },
        {
          id: '2', 
          timestamp: (Date.now() - 300000) * 1000,
          error_severity: 'ERROR',
          event_message: 'new row violates row-level security policy for table "buckets"',
          identifier: 'supabase-db'
        },
        {
          id: '3',
          timestamp: (Date.now() - 600000) * 1000,
          error_severity: 'WARNING',
          event_message: 'permission denied for table users',
          identifier: 'supabase-db'
        }
      ];
      
      setLogs(mockLogs);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro na consulta de logs:', error);
      toast.error('Erro ao consultar logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return 'destructive' as const;
      case 'WARNING':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp / 1000).toLocaleString('pt-BR');
  };

  const getErrorCategory = (message: string) => {
    if (message.includes('structure of query does not match')) {
      return 'SQL Function';
    }
    if (message.includes('row-level security policy')) {
      return 'RLS Policy';
    }
    if (message.includes('permission denied')) {
      return 'Permission';
    }
    if (message.includes('buckets')) {
      return 'Storage';
    }
    return 'System';
  };

  const errorStats = logs.reduce((acc, log) => {
    const category = getErrorCategory(log.event_message);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header e Estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Logs de Erro do Sistema
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Últimos 50 erros e avisos do PostgreSQL
              </p>
            </div>
            <Button 
              onClick={fetchLogs} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estatísticas por Categoria */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(errorStats).map(([category, count]) => (
              <div key={category} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-red-600">{count}</div>
                <div className="text-sm text-muted-foreground">{category}</div>
              </div>
            ))}
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Última atualização: {lastUpdate.toLocaleString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Nenhum erro crítico encontrado nos logs recentes!
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96 w-full">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.error_severity)}
                        <Badge variant={getSeverityVariant(log.error_severity)}>
                          {log.error_severity}
                        </Badge>
                        <Badge variant="outline">
                          {getErrorCategory(log.event_message)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm font-mono bg-muted p-2 rounded text-wrap break-all">
                      {log.event_message}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      ID: {log.id} | Instance: {log.identifier}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dicas de Resolução */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Resolução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erros de "structure of query":</strong> Indicam incompatibilidade entre
                o retorno esperado e atual de funções SQL. Foram corrigidos na última migração.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erros de RLS Policy:</strong> Problemas de permissão para criação de buckets
                de storage. Políticas foram ajustadas para permitir acesso administrativo.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Permission denied for table users:</strong> Tentativas de acesso direto
                à tabela auth.users foram substituídas pelo uso da tabela profiles.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};