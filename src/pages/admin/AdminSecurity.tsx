
import React from 'react';
import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';

const AdminSecurity: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real de eventos de segurança e métricas do sistema
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
};

export default AdminSecurity;
