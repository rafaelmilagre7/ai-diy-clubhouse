/**
 * COMPONENTE DE ALERTAS DE SEGURANÇA EM TEMPO REAL
 * ================================================
 * 
 * Exibe alertas de segurança críticos na interface admin
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Activity, X } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/security/useSecurityMonitoring';

export function SecurityAlertsWidget() {
  const { alerts, metrics, isMonitoring, dismissAlert, runSecurityScan } = useSecurityMonitoring();

  if (!isMonitoring) {
    return (
      <div className="aurora-glass rounded-2xl p-8 border border-muted/30 backdrop-blur-md">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 aurora-glass mx-auto w-fit">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold aurora-text-gradient mb-2">Monitoramento de Segurança</h3>
            <p className="text-muted-foreground">
              Acesso restrito a administradores do sistema
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-status-warning" />;
      case 'medium':
        return <Activity className="h-5 w-5 text-status-warning" />;
      default:
        return <Activity className="h-5 w-5 text-operational" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" | "info" | "warning" | "success" => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getAlertGradient = (type: string) => {
    switch (type) {
      case 'critical':
        return 'from-destructive/20 to-red-500/10';
      case 'high':
        return 'from-orange-500/20 to-red-500/10';
      case 'medium':
        return 'from-amber-500/20 to-yellow-500/10';
      default:
        return 'from-blue-500/20 to-cyan-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Security Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Violações (24h)",
            value: metrics.recentViolations,
            icon: AlertTriangle,
            gradient: "from-destructive/20 to-red-500/10",
            iconColor: "text-destructive",
            border: "border-destructive/30"
          },
          {
            label: "Falhas de Login",
            value: metrics.failedLogins,
            icon: Shield,
            gradient: "from-status-warning/20 to-status-warning/10",
            iconColor: "text-status-warning",
            border: "border-status-warning/30"
          },
          {
            label: "IPs Suspeitos",
            value: metrics.suspiciousIPs.length,
            icon: Activity,
            gradient: "from-warning/20 to-warning-light/10",
            iconColor: "text-warning",
            border: "border-warning/30"
          },
          {
            label: "Total Violações",
            value: metrics.totalViolations,
            icon: X,
            gradient: "from-operational/20 to-operational/10",
            iconColor: "text-operational",
            border: "border-operational/30"
          }
        ].map((metric, index) => (
          <div 
            key={metric.label} 
            className={`aurora-glass rounded-2xl border ${metric.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-slower hover:scale-[1.02] hover:shadow-2xl animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold aurora-text-gradient group-hover:scale-110 transition-transform duration-slow">
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-slow">
                {metric.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Scan Control */}
      <div className="aurora-glass rounded-2xl p-6 border border-aurora/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold aurora-text-gradient mb-1">Controle de Varredura</h3>
            <p className="text-sm text-muted-foreground">
              {metrics.lastSecurityScan 
                ? `Última varredura: ${metrics.lastSecurityScan.toLocaleString('pt-BR')}`
                : 'Nenhuma varredura executada'
              }
            </p>
          </div>
          <Button 
            onClick={runSecurityScan}
            className="h-12 px-6 bg-gradient-to-r from-aurora to-viverblue hover:from-aurora-dark hover:to-viverblue-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-slow"
          >
            <Activity className="h-4 w-4 mr-2" />
            Nova Varredura
          </Button>
        </div>
      </div>

      {/* Enhanced Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div 
              key={alert.id} 
              className={`aurora-glass rounded-2xl border backdrop-blur-md overflow-hidden animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`bg-gradient-to-r ${getAlertGradient(alert.type)} p-6 border-b border-white/10`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${getAlertGradient(alert.type)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getAlertVariant(alert.type)} className="font-medium">
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium">
                          {alert.timestamp.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="font-medium text-foreground mb-2">
                        {alert.message}
                      </p>
                      {alert.action && (
                        <div className="p-3 aurora-glass rounded-lg bg-gradient-to-r from-white/5 to-transparent">
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            💡 Ação recomendada: {alert.action}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-8 w-8 p-0 hover:bg-white/10 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Suspicious IPs */}
      {metrics.suspiciousIPs.length > 0 && (
        <div className="aurora-glass rounded-2xl border border-status-warning/20 backdrop-blur-md overflow-hidden">
          <div className="bg-gradient-to-r from-status-warning/10 via-status-error/5 to-transparent p-6 border-b border-status-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-status-warning/20 to-status-error/10 aurora-glass">
                <Activity className="h-5 w-5 text-status-warning" />
              </div>
              <h3 className="text-lg font-bold aurora-text-gradient">
                IPs Suspeitos Detectados
              </h3>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {metrics.suspiciousIPs.map((ip, index) => (
              <div 
                key={ip} 
                className="flex items-center justify-between p-4 aurora-glass rounded-xl border border-orange-500/20 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full aurora-pulse"></div>
                  <code className="font-mono font-medium">{ip}</code>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="hover:shadow-lg transition-all duration-slow"
                  onClick={() => {
                    console.log(`Bloqueando IP: ${ip}`);
                  }}
                >
                  Bloquear
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Healthy Status */}
      {alerts.length === 0 && metrics.recentViolations === 0 && (
        <div className="aurora-glass rounded-2xl p-8 border border-operational/20 backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-operational/20 to-operational/10 aurora-glass mx-auto w-fit">
              <Shield className="h-8 w-8 text-operational aurora-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold aurora-text-gradient mb-2">Sistema Seguro</h3>
              <p className="text-muted-foreground">
                Nenhuma atividade suspeita detectada nas últimas 24 horas.
              </p>
              {metrics.lastSecurityScan && (
                <p className="text-sm text-muted-foreground mt-2">
                  Monitoramento ativo desde {metrics.lastSecurityScan.toLocaleString('pt-BR')}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}