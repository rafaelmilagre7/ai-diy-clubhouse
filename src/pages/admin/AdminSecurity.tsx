
import React from 'react';
import { SecurityViolationsMonitor } from '@/components/admin/security/SecurityViolationsMonitor';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecurityAlertsWidget } from '@/components/security/SecurityAlertsWidget';

const AdminSecurity: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real de eventos de segurança e métricas do sistema
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Widget de Alertas de Segurança */}
        <SecurityAlertsWidget />
        
        {/* Dashboard Principal */}
        <SecurityDashboard />
        
        <SecurityViolationsMonitor />
      </div>
    </div>
  );
};

export default AdminSecurity;
