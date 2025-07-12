import React, { useState } from 'react';
import { useSecurityMetrics } from '@/hooks/security/useSecurityMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Activity, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Carregando dados de segurança...</span>
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
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Violações</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViolations}</div>
            <p className="text-xs text-muted-foreground">
              Período de {metrics.periodDays} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violações Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalViolations}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violações Recentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentViolations}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {metrics.periodDays} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {metrics.criticalViolations > 0 ? (
              <XCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.criticalViolations > 0 ? 'text-destructive' : 'text-success'}`}>
              {metrics.criticalViolations > 0 ? 'Alerta' : 'Seguro'}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema {metrics.criticalViolations > 0 ? 'comprometido' : 'protegido'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="violations" className="w-full">
        <TabsList>
          <TabsTrigger value="violations">Violações Recentes</TabsTrigger>
          <TabsTrigger value="types">Tipos de Violação</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violações de Segurança</CardTitle>
              <CardDescription>
                Lista das violações detectadas nos últimos {days} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma violação detectada no período.
                  </p>
                ) : (
                  violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(violation.severity)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <span className="font-medium">{violation.violationType}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {violation.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(violation.createdAt), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                            {violation.ipAddress && (
                              <span>IP: {violation.ipAddress}</span>
                            )}
                            {violation.resourceAccessed && (
                              <span>Recurso: {violation.resourceAccessed}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isAdmin && !violation.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveViolation(violation.id)}
                          disabled={resolvingId === violation.id}
                        >
                          {resolvingId === violation.id ? 'Resolvendo...' : 'Resolver'}
                        </Button>
                      )}
                      {violation.resolved && (
                        <Badge variant="outline" className="text-success">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Violação</CardTitle>
              <CardDescription>
                Distribuição dos tipos de violações mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topViolationTypes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum tipo de violação registrado.
                  </p>
                ) : (
                  metrics.topViolationTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <Badge variant="outline">{type.count} ocorrências</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};