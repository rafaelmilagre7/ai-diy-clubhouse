
import React from 'react';
import { SecurityViolationsMonitor } from '@/components/admin/security/SecurityViolationsMonitor';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecurityAlertsWidget } from '@/components/security/SecurityAlertsWidget';
import { BlockedIPsManager } from '@/components/security/BlockedIPsManager';
import { Shield, Eye, AlertTriangle, Ban } from 'lucide-react';

const AdminSecurity: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora-primary/5 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />

      {/* Header with Aurora Style */}
      <div className="relative aurora-glass rounded-2xl p-8 border border-aurora-primary/20 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-16 bg-gradient-to-b from-aurora-primary via-operational to-strategy rounded-full aurora-glow"></div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-operational/10 aurora-glass">
                  <Shield className="h-6 w-6 text-aurora-primary" />
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
            <div className="w-3 h-3 bg-gradient-to-r from-operational to-operational-light rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Monitoramento Ativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-strategy to-strategy-light rounded-full aurora-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">
              Análise em Tempo Real
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Enhanced Security Alerts Widget */}
        <div className="aurora-glass rounded-2xl border border-aurora-primary/20 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-aurora-primary/10 via-operational/5 to-transparent p-8 border-b border-aurora-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-operational/10 aurora-glass">
                <AlertTriangle className="h-6 w-6 text-aurora-primary" />
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
        <div className="aurora-glass rounded-2xl border border-operational/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-200">
          <div className="bg-gradient-to-r from-operational/10 via-strategy/5 to-transparent p-8 border-b border-operational/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-operational/20 to-strategy/10 aurora-glass">
                <Shield className="h-6 w-6 text-operational" />
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
        <div className="aurora-glass rounded-2xl border border-strategy/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-500">
          <div className="bg-gradient-to-r from-strategy/10 via-revenue/5 to-transparent p-8 border-b border-strategy/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-strategy/20 to-revenue/10 aurora-glass">
                <Eye className="h-6 w-6 text-strategy" />
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

        {/* Blocked IPs Manager */}
        <div className="aurora-glass rounded-2xl border border-red-500/20 backdrop-blur-md overflow-hidden animate-fade-in animation-delay-700">
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent p-8 border-b border-red-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 aurora-glass">
                <Ban className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold aurora-text-gradient">IPs Bloqueados</h2>
                <p className="text-muted-foreground font-medium">
                  Gerenciamento de IPs suspeitos bloqueados automaticamente
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <BlockedIPsManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
