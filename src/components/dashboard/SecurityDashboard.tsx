
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { Shield, Lock, Eye, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

export const SecurityDashboard: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Painel de Segurança</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitor de Segurança */}
        <SecurityMonitor />

        {/* Status dos Sistemas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Status dos Sistemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Autenticação Segura</span>
              </div>
              <span className="text-xs text-green-600 font-medium">ATIVO</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Rate Limiting</span>
              </div>
              <span className="text-xs text-green-600 font-medium">ATIVO</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Auditoria de Logs</span>
              </div>
              <span className="text-xs text-green-600 font-medium">ATIVO</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Criptografia Avançada</span>
              </div>
              <span className="text-xs text-green-600 font-medium">ATIVO</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recursos de Segurança Implementados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">🔐 Autenticação Segura</h3>
              <p className="text-xs text-gray-600">
                Sistema de autenticação com rate limiting, validação de sessão e logout automático por inatividade.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">🛡️ Validação de Entrada</h3>
              <p className="text-xs text-gray-600">
                Validação robusta de dados de entrada com detecção de tentativas de injeção XSS e SQL.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">📊 Auditoria Completa</h3>
              <p className="text-xs text-gray-600">
                Logs detalhados de todas as ações importantes com rastreamento de eventos de segurança.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">🔒 Criptografia Avançada</h3>
              <p className="text-xs text-gray-600">
                Criptografia de dados sensíveis usando WebCrypto API com fallbacks seguros.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">⚡ Rate Limiting</h3>
              <p className="text-xs text-gray-600">
                Proteção contra ataques de força bruta com bloqueio progressivo de IPs suspeitos.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">🌐 Headers de Segurança</h3>
              <p className="text-xs text-gray-600">
                Headers HTTP de segurança incluindo CSP, HSTS e proteções contra clickjacking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
