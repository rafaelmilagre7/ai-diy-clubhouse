
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { HealthCheckSection } from '@/components/admin/invites/health/HealthCheckSection';

const HealthCheck = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Check Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento completo da saúde dos usuários e sistema
          </p>
        </div>
      </div>

      <HealthCheckSection />
    </div>
  );
};

export default HealthCheck;
