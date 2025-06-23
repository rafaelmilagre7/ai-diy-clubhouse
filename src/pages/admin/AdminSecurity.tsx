
import React from 'react';
import { SecurityOverview } from '@/components/admin/security/SecurityOverview';
import { SecurityMetrics } from '@/components/admin/security/SecurityMetrics';
import { SecurityAlerts } from '@/components/admin/security/SecurityAlerts';
import { AuditLogsMonitor } from '@/components/admin/security/AuditLogsMonitor';
import { ActiveSessions } from '@/components/admin/security/ActiveSessions';

const AdminSecurity = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segurança do Sistema</h1>
        <p className="text-muted-foreground">
          Monitore e gerencie a segurança da aplicação em tempo real
        </p>
      </div>
      
      {/* Visão Geral de Segurança */}
      <SecurityOverview />
      
      {/* Métricas e Estatísticas */}
      <SecurityMetrics />
      
      {/* Alertas de Segurança */}
      <SecurityAlerts />
      
      {/* Grid com Monitoramento e Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuditLogsMonitor />
        <ActiveSessions />
      </div>
    </div>
  );
};

export default AdminSecurity;
