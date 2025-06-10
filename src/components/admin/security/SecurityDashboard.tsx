
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { secureLogger } from '@/utils/secureLogger';

interface SecurityEvent {
  id: string;
  type: 'auth' | 'access' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  userId?: string;
  details: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeUsers: number;
  suspiciousActivity: number;
  lastIncident: string | null;
}

export const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeUsers: 0,
    suspiciousActivity: 0,
    lastIncident: null
  });
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Carregar logs armazenados localmente
      const storedLogs = secureLogger.getStoredLogs();
      
      // Filtrar eventos de segurança
      const securityEvents = storedLogs
        .filter(log => log.level === 'security')
        .slice(-20) // Últimos 20 eventos
        .map(log => ({
          id: `${log.timestamp}-${Math.random()}`,
          type: log.metadata?.securityEvent?.type || 'system',
          severity: log.metadata?.securityEvent?.severity || 'low',
          description: log.message,
          timestamp: log.timestamp,
          userId: log.userId,
          details: log.metadata || {}
        })) as SecurityEvent[];

      setRecentEvents(securityEvents);

      // Calcular métricas
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEvents = securityEvents.filter(
        event => new Date(event.timestamp) >= last24Hours
      );

      setMetrics({
        totalEvents: recentEvents.length,
        criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
        activeUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
        suspiciousActivity: recentEvents.filter(e => 
          e.type === 'auth' || e.severity === 'high'
        ).length,
        lastIncident: securityEvents.length > 0 ? securityEvents[0].timestamp : null
      });

    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth': return <Lock className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'data': return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              eventos críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              únicos nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativ. Suspeita</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              eventos suspeitos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {metrics.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.criticalEvents} evento(s) crítico(s) detectado(s) nas últimas 24 horas. 
            Revise imediatamente os logs de segurança.
          </AlertDescription>
        </Alert>
      )}

      {/* Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Eventos de Segurança Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum evento de segurança registrado
            </p>
          ) : (
            <div className="space-y-4">
              {recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                      <Badge variant="outline">
                        {event.type}
                      </Badge>
                      {event.userId && (
                        <span className="text-xs text-muted-foreground">
                          User: {event.userId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-1">
                      {event.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </div>
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
