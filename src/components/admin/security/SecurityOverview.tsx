
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export const SecurityOverview = () => {
  // Dados mock para demonstração - em produção viria de APIs reais
  const securityStatus = {
    overall: 'SECURE',
    rls_enabled: true,
    auth_enabled: true,
    ssl_enabled: true,
    rate_limiting: true,
    last_check: new Date().toLocaleString('pt-BR')
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SECURE':
        return <Badge variant="default" className="bg-green-500"><ShieldCheck className="h-3 w-3 mr-1" />Seguro</Badge>;
      case 'WARNING':
        return <Badge variant="destructive"><ShieldAlert className="h-3 w-3 mr-1" />Atenção</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Crítico</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Status Geral de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status do Sistema</span>
            {getStatusBadge(securityStatus.overall)}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${securityStatus.rls_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">RLS Ativo</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${securityStatus.auth_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Autenticação</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${securityStatus.ssl_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">SSL/TLS</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${securityStatus.rate_limiting ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Rate Limiting</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              Última verificação: {securityStatus.last_check}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
