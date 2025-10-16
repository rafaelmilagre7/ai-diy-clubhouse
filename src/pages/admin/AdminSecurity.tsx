
import React from 'react';
import { SecurityViolationsMonitor } from '@/components/admin/security/SecurityViolationsMonitor';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecurityAlertsWidget } from '@/components/security/SecurityAlertsWidget';
import { Shield, Eye, AlertTriangle } from 'lucide-react';

const AdminSecurity: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-destructive/5 p-6 space-y-8 relative overflow-hidden">
      {/* Aurora Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-destructive/8 to-destructive-dark/4 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-60 left-20 w-96 h-96 bg-gradient-to-br from-warning/6 to-warning-light/3 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-br from-amber-500/4 to-aurora/3 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Aurora Style */}
      <div className="relative aurora-glass rounded-2xl p-8 border border-destructive/20 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-16 bg-gradient-to-b from-destructive via-orange-500 to-amber-500 rounded-full aurora-glow"></div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive-dark/10 aurora-glass">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold aurora-text-gradient">
                  Dashboard de Segurança
                </h1>
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                Monitoramento em tempo real de eventos críticos e métricas do sistema
              </p>
            </div>
          </div>
        </div>
        
        {/* Security Status Indicators */}
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-success to-success-light rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Sistema Protegido
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Monitoramento Ativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-operational to-operational-light rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Análise em Tempo Real
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Enhanced Security Alerts Widget */}
        <div className="aurora-glass rounded-2xl border border-destructive/20 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-destructive/10 via-orange-500/5 to-transparent p-8 border-b border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-orange-500/10 aurora-glass">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-bold aurora-text-gradient">Alertas de Segurança</h2>
                <p className="text-muted-foreground font-medium">
                  Monitoramento de ameaças e violações críticas
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <SecurityAlertsWidget />
          </div>
        </div>
        
        {/* Enhanced Security Dashboard */}
        <div className="aurora-glass rounded-2xl border border-amber-500/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-200">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-8 border-b border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning-dark/10 aurora-glass">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="text-2xl font-bold aurora-text-gradient">Métricas de Segurança</h2>
                <p className="text-muted-foreground font-medium">
                  Análise estatística e tendências do sistema
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <SecurityDashboard />
          </div>
        </div>
        
        {/* Enhanced Violations Monitor */}
          <div className="aurora-glass rounded-2xl border border-warning/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-500">
          <div className="bg-gradient-to-r from-warning/10 via-warning-light/5 to-transparent p-8 border-b border-warning/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning-light/10 aurora-glass">
                <Eye className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="text-2xl font-bold aurora-text-gradient">Monitor de Violações</h2>
                <p className="text-muted-foreground font-medium">
                  Detecção e análise de atividades suspeitas
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <SecurityViolationsMonitor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
