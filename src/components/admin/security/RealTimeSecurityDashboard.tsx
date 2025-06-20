
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityIncidentManager } from './SecurityIncidentManager';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  metadata?: any;
}

export const RealTimeSecurityDashboard = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Segurança em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityIncidentManager incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  );
};
