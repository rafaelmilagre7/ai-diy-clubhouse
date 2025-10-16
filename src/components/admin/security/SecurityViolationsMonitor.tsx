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
      <div className="space-y-6 animate-fade-in">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-orange-500/20 backdrop-blur-md overflow-hidden animate-pulse">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/5 p-6">
                <div className="w-12 h-8 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-lg mb-2"></div>
                <div className="w-16 h-3 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Content */}
        <div className="aurora-glass rounded-2xl border border-orange-500/20 backdrop-blur-md p-8">
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 aurora-glass rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-full aurora-pulse"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold aurora-text-gradient">Carregando Dados de Segurança</h3>
              <p className="text-muted-foreground">Analisando violações do sistema...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            label: "Total",
            value: stats.total,
            gradient: "from-aurora-primary/20 to-aurora-primary/10",
            border: "border-aurora-primary/30",
            icon: "🛡️"
          },
          {
            label: "Críticas",
            value: stats.critical,
            gradient: "from-destructive/20 to-red-500/10",
            border: "border-destructive/30",
            icon: "🚨"
          },
          {
            label: "Altas",
            value: stats.high,
            gradient: "from-orange-500/20 to-red-500/10",
            border: "border-orange-500/30",
            icon: "⚠️"
          },
          {
            label: "Médias",
            value: stats.medium,
            gradient: "from-amber-500/20 to-yellow-500/10",
            border: "border-amber-500/30",
            icon: "⚡"
          },
          {
            label: "Últimas 24h",
            value: stats.last24h,
            gradient: "from-green-500/20 to-emerald-500/10",
            border: "border-green-500/30",
            icon: "🕐"
          }
        ].map((stat, index) => (
          <div 
            key={stat.label}
            className={`aurora-glass rounded-2xl border ${stat.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${stat.gradient} p-6 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-right">
                  <p className="text-3xl font-bold aurora-text-gradient group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="font-medium text-foreground group-hover:text-foreground transition-colors duration-300">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <div className="aurora-glass rounded-2xl border border-destructive/30 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-destructive/15 via-red-500/10 to-transparent p-6 border-b border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/25 to-red-500/15 aurora-glass">
                <AlertTriangle className="h-6 w-6 text-destructive aurora-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-destructive">⚠️ Violações Críticas Detectadas</h3>
                <p className="text-muted-foreground font-medium">
                  {stats.critical} violação(ões) crítica(s) detectada(s). Revise imediatamente as atividades suspeitas abaixo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Violations List */}
      <div className="aurora-glass rounded-2xl border border-orange-500/20 backdrop-blur-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent p-6 border-b border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 aurora-glass">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold aurora-text-gradient">Violações Recentes</h3>
                <p className="text-muted-foreground font-medium">
                  Monitoramento em tempo real de atividades suspeitas
                </p>
              </div>
            </div>
            <Button 
              onClick={loadViolations}
              disabled={loading}
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        
        <div className="p-8">
          {violations.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 aurora-glass mx-auto w-fit mb-6">
                <Shield className="h-16 w-16 text-green-500 aurora-pulse" />
              </div>
              <h4 className="text-2xl font-bold aurora-text-gradient mb-4">Sistema Protegido</h4>
              <p className="text-lg text-muted-foreground mb-2">
                Nenhuma violação de segurança detectada
              </p>
              <p className="text-sm text-muted-foreground">
                O sistema está funcionando normalmente e todas as atividades estão sendo monitoradas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {violations.map((violation, index) => (
                <div 
                  key={violation.id}
                  className="aurora-glass rounded-2xl p-6 border border-muted/20 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl aurora-glass ${
                      violation.severity === 'critical' ? 'bg-gradient-to-br from-destructive/25 to-destructive/15' :
                      violation.severity === 'high' ? 'bg-gradient-to-br from-warning/25 to-warning/15' :
                      violation.severity === 'medium' ? 'bg-gradient-to-br from-warning/20 to-warning/10' :
                      'bg-gradient-to-br from-aurora-primary/25 to-aurora-primary/15'
                    }`}>
                      {getSeverityIcon(violation.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge 
                          variant={getSeverityColor(violation.severity) as any} 
                          className="font-medium text-sm px-3 py-1"
                        >
                          {violation.severity === 'critical' && '🚨'} 
                          {violation.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {violation.event_type}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-2">
                          {formatViolationDescription(violation)}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          {violation.user_id && (
                            <div className="flex items-center gap-2 p-2 aurora-glass rounded-lg">
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="font-mono">{violation.user_id.substring(0, 8)}***</span>
                            </div>
                          )}
                          
                          {violation.resource_id && (
                            <div className="flex items-center gap-2 p-2 aurora-glass rounded-lg">
                              <Database className="h-4 w-4 text-green-500" />
                              <span className="font-mono">{violation.resource_id}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 p-2 aurora-glass rounded-lg">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>{new Date(violation.timestamp).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        
                        {violation.details && Object.keys(violation.details).length > 0 && (
                          <details className="mt-4 group">
                            <summary className="cursor-pointer p-3 aurora-glass rounded-lg hover:bg-muted/10 transition-colors duration-300">
                              <span className="font-medium text-primary group-open:text-primary-dark">
                                🔍 Ver detalhes técnicos
                              </span>
                            </summary>
                            <div className="mt-3 p-4 aurora-glass rounded-lg border border-muted/20">
                              <pre className="text-xs overflow-auto max-h-40 text-muted-foreground font-mono">
                                {JSON.stringify(violation.details, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};