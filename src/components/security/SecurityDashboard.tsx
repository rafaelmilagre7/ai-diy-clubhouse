import React, { useState } from 'react';
import { useSecurityMetrics } from '@/hooks/security/useSecurityMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Activity, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityDashboardProps {
  days?: number;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ days = 7 }) => {
  const { metrics, violations, loading, error, resolveViolation, isAdmin } = useSecurityMetrics(days);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolveViolation = async (violationId: string) => {
    setResolvingId(violationId);
    try {
      await resolveViolation(violationId);
    } catch (error) {
      console.error('Erro ao resolver violação:', error);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Loading Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md overflow-hidden animate-pulse">
              <div className="bg-gradient-to-r from-aurora/10 to-viverblue/5 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-gradient-to-br from-aurora/20 to-viverblue/10 rounded-xl"></div>
                  <div className="w-12 h-8 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-lg"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="w-24 h-3 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Content */}
        <div className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md p-8">
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 aurora-glass rounded-full border-4 border-aurora/30 border-t-aurora animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-aurora/20 to-viverblue/10 rounded-full aurora-pulse"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold aurora-text-gradient">Carregando Dados de Segurança</h3>
              <p className="text-muted-foreground">Analisando métricas do sistema...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de segurança: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado de segurança disponível.
        </AlertDescription>
      </Alert>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total de Violações",
            value: metrics.totalViolations,
            icon: Shield,
            gradient: "from-operational/20 to-operational/10",
            iconColor: "text-operational",
            border: "border-operational/30",
            description: `Período de ${metrics.periodDays} dias`
          },
          {
            label: "Violações Críticas",
            value: metrics.criticalViolations,
            icon: AlertTriangle,
            gradient: "from-destructive/20 to-red-500/10",
            iconColor: "text-destructive",
            border: "border-destructive/30",
            description: "Requer atenção imediata"
          },
          {
            label: "Violações Recentes",
            value: metrics.recentViolations,
            icon: TrendingUp,
            gradient: "from-status-warning/20 to-status-warning/10",
            iconColor: "text-status-warning",
            border: "border-status-warning/30",
            description: `Últimos ${metrics.periodDays} dias`
          },
          {
            label: "Status do Sistema",
            value: metrics.criticalViolations > 0 ? 'Alerta' : 'Seguro',
            icon: metrics.criticalViolations > 0 ? XCircle : CheckCircle,
            gradient: metrics.criticalViolations > 0 
              ? "from-destructive/20 to-red-500/10" 
              : "from-operational/20 to-operational/10",
            iconColor: metrics.criticalViolations > 0 ? "text-destructive" : "text-operational",
            border: metrics.criticalViolations > 0 ? "border-destructive/30" : "border-operational/30",
            description: metrics.criticalViolations > 0 ? 'Sistema comprometido' : 'Sistema protegido'
          }
        ].map((metric, index) => (
          <div 
            key={metric.label} 
            className={`aurora-glass rounded-2xl border ${metric.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold group-hover:scale-110 transition-transform duration-300 ${
                    metric.value === 'Alerta' ? 'text-destructive' : 
                    metric.value === 'Seguro' ? 'text-green-500' : 
                    'aurora-text-gradient'
                  }`}>
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="font-medium text-foreground group-hover:text-foreground transition-colors duration-300 mb-1">
                {metric.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="violations" className="w-full">
        <TabsList className="aurora-glass border-aurora/20 backdrop-blur-md h-12 rounded-2xl p-1">
          <TabsTrigger 
            value="violations"
            className="data-[state=active]:aurora-glass data-[state=active]:bg-gradient-to-r data-[state=active]:from-destructive/20 data-[state=active]:to-red-500/10 data-[state=active]:text-destructive data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-medium"
          >
            Violações Recentes
          </TabsTrigger>
          <TabsTrigger 
            value="types"
            className="data-[state=active]:aurora-glass data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/10 data-[state=active]:text-blue-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-medium"
          >
            Tipos de Violação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-6 mt-8">
          <div className="aurora-glass rounded-2xl border border-destructive/20 backdrop-blur-md overflow-hidden">
            <div className="bg-gradient-to-r from-destructive/10 via-red-500/5 to-transparent p-6 border-b border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-red-500/10 aurora-glass">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold aurora-text-gradient">Violações de Segurança</h3>
                  <p className="text-muted-foreground font-medium">
                    Lista das violações detectadas nos últimos {days} dias
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {violations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 aurora-glass mx-auto w-fit mb-4">
                      <Shield className="h-12 w-12 text-green-500 aurora-pulse" />
                    </div>
                    <h4 className="text-lg font-bold aurora-text-gradient mb-2">Nenhuma Violação Detectada</h4>
                    <p className="text-muted-foreground">
                      O sistema está funcionando normalmente no período analisado.
                    </p>
                  </div>
                ) : (
                  violations.map((violation, index) => (
                    <div
                      key={violation.id}
                      className="aurora-glass rounded-xl p-6 border border-muted/20 backdrop-blur-sm animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-xl aurora-glass ${
                            violation.severity === 'critical' ? 'bg-gradient-to-br from-destructive/20 to-red-500/10' :
                            violation.severity === 'high' ? 'bg-gradient-to-br from-orange-500/20 to-red-500/10' :
                            violation.severity === 'medium' ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10' :
                            'bg-gradient-to-br from-blue-500/20 to-cyan-500/10'
                          }`}>
                            {getSeverityIcon(violation.severity)}
                          </div>
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant={getSeverityColor(violation.severity)} className="font-medium">
                                {violation.severity.toUpperCase()}
                              </Badge>
                              <span className="font-bold text-foreground">{violation.violationType}</span>
                            </div>
                            <p className="text-muted-foreground">
                              {violation.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(violation.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                              {violation.ipAddress && (
                                <span className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  IP: {violation.ipAddress}
                                </span>
                              )}
                              {violation.resourceAccessed && (
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Recurso: {violation.resourceAccessed}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {violation.resolved ? (
                            <Badge variant="outline" className="text-operational border-operational/30 bg-operational/10">
                              ✓ Resolvido
                            </Badge>
                          ) : isAdmin ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveViolation(violation.id)}
                              disabled={resolvingId === violation.id}
                              className="hover:shadow-lg transition-all duration-300"
                            >
                              {resolvingId === violation.id ? 'Resolvendo...' : 'Resolver'}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-6 mt-8">
          <div className="aurora-glass rounded-2xl border border-operational/20 backdrop-blur-md overflow-hidden">
            <div className="bg-gradient-to-r from-operational/10 via-operational/5 to-transparent p-6 border-b border-operational/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-operational/20 to-operational/10 aurora-glass">
                  <TrendingUp className="h-5 w-5 text-operational" />
                </div>
                <div>
                  <h3 className="text-xl font-bold aurora-text-gradient">Tipos de Violação</h3>
                  <p className="text-muted-foreground font-medium">
                    Distribuição dos tipos de violações mais comuns
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topViolationTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 aurora-glass mx-auto w-fit mb-4">
                      <TrendingUp className="h-12 w-12 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold aurora-text-gradient mb-2">Nenhum Tipo Registrado</h4>
                    <p className="text-muted-foreground">
                      Não há tipos de violação registrados no período.
                    </p>
                  </div>
                ) : (
                  metrics.topViolationTypes.map((type, index) => (
                    <div 
                      key={type.type} 
                      className="aurora-glass rounded-xl p-4 border border-muted/20 backdrop-blur-sm animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-aurora/10 aurora-glass flex items-center justify-center">
                            <span className="text-sm font-bold aurora-text-gradient">{index + 1}</span>
                          </div>
                          <span className="font-medium text-foreground">{type.type}</span>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {type.count} ocorrências
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};