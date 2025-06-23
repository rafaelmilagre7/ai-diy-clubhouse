
import React from 'react';
import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';

const AdminSecurity = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segurança</h1>
        <p className="text-muted-foreground">
          Monitore e gerencie a segurança do sistema
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
};

export default AdminSecurity;
