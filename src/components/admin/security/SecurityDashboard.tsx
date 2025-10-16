
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { OptimizedRealTimeSecurityDashboard } from './OptimizedRealTimeSecurityDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export const SecurityDashboard = () => {
  const { isAdmin, user } = useAuth();

  // Se não for admin, mostrar acesso negado
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar o dashboard de segurança.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se for admin, renderizar o dashboard otimizado
  return (
    <div className="space-y-6">
      {/* Banner de identificação */}
      <div className="bg-gradient-to-r from-aurora-primary to-secondary rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">Sistema de Segurança Avançado - FASE 4 (OTIMIZADO)</h2>
            <p className="text-sm opacity-90">
              Monitoramento em tempo real com detecção de anomalias, alertas inteligentes e performance otimizada
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard otimizado */}
      <OptimizedRealTimeSecurityDashboard />
    </div>
  );
};
