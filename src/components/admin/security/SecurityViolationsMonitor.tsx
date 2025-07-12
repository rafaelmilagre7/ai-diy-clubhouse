import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Clock,
  User,
  Database,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SecurityViolation {
  id: string;
  user_id: string;
  event_type: string;
  action: string;
  details: any;
  severity: string;
  timestamp: string;
  resource_id?: string;
}

export const SecurityViolationsMonitor: React.FC = () => {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    last24h: 0
  });

  const loadViolations = async () => {
    try {
      setLoading(true);
      
      // Buscar violações de segurança
      const { data: violationsData, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('event_type', ['security_violation', 'security_event', 'role_change'])
        .in('severity', ['critical', 'high', 'medium'])
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar violações:', error);
        toast.error('Erro ao carregar dados de segurança');
        return;
      }

      setViolations(violationsData || []);

      // Calcular estatísticas
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const newStats = {
        total: violationsData?.length || 0,
        critical: violationsData?.filter(v => v.severity === 'critical').length || 0,
        high: violationsData?.filter(v => v.severity === 'high').length || 0,
        medium: violationsData?.filter(v => v.severity === 'medium').length || 0,
        low: violationsData?.filter(v => v.severity === 'low').length || 0,
        last24h: violationsData?.filter(v => new Date(v.timestamp) > last24h).length || 0
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar violações:', error);
      toast.error('Erro interno ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadViolations, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Shield className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const formatViolationDescription = (violation: SecurityViolation) => {
    const details = violation.details || {};
    
    switch (violation.action) {
      case 'unauthorized_update_attempt':
        return `Tentativa de atualização não autorizada na tabela ${details.table_name}`;
      case 'role_change':
        return `Mudança de papel: ${details.old_role_name || 'N/A'} → ${details.new_role_name || 'N/A'}`;
      case 'unauthorized_access_attempt':
        return 'Tentativa de acesso não autorizado detectada';
      case 'multiple_role_change_attempts':
        return `${details.attempts_count} tentativas de mudança de papel em ${details.time_window}`;
      default:
        return violation.action.replace(/_/g, ' ').toUpperCase();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitor de Violações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dados de segurança...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Críticas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
            <div className="text-sm text-muted-foreground">Altas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
            <div className="text-sm text-muted-foreground">Médias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.last24h}</div>
            <div className="text-sm text-muted-foreground">Últimas 24h</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {stats.critical > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Violações Críticas Detectadas</AlertTitle>
          <AlertDescription>
            {stats.critical} violação(ões) crítica(s) detectada(s). Revise imediatamente as atividades suspeitas abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Violações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Violações Recentes
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadViolations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma violação de segurança detectada</p>
              <p className="text-sm">Sistema funcionando normalmente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation) => (
                <div 
                  key={violation.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getSeverityIcon(violation.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(violation.severity) as any}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {violation.event_type}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium mb-1">
                      {formatViolationDescription(violation)}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {violation.user_id && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{violation.user_id.substring(0, 8)}***</span>
                        </div>
                      )}
                      
                      {violation.resource_id && (
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          <span>{violation.resource_id}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(violation.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    {violation.details && Object.keys(violation.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer hover:text-primary">
                          Ver detalhes técnicos
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(violation.details, null, 2)}
                        </pre>
                      </details>
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