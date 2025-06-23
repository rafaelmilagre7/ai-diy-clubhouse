
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { HealthCheckSection } from './HealthCheckSection';

export const UserHealthDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
          <p className="text-muted-foreground">
            Monitoramento da saúde e atividade dos usuários da plataforma
          </p>
        </div>
      </div>

      <HealthCheckSection />
    </div>
  );
};
