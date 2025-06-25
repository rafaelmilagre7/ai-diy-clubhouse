
import React from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { RLSPhase3Dashboard } from './RLSPhase3Dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export const SecurityDashboard = () => {
  const { isAdmin, user } = useSimpleAuth();

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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">
              Sistema de Segurança RLS - FASE 3 COMPLETA ✅
            </h2>
            <p className="text-sm opacity-90">
              100% de proteção RLS com monitoramento automático, detecção de regressão e alertas inteligentes
            </p>
          </div>
        </div>
      </div>

      <RLSPhase3Dashboard />
    </div>
  );
};
