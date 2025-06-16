
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { useSecurityStatus } from '@/hooks/admin/useSecurityStatus';
import { SecurityStatusTable } from '@/components/admin/SecurityStatusTable';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminSecurity: React.FC = () => {
  const { isLoading, securityData, error, checkSecurityStatus } = useSecurityStatus();

  useEffect(() => {
    checkSecurityStatus();
  }, [checkSecurityStatus]);

  const handleRefresh = () => {
    checkSecurityStatus();
  };

  const secureCount = securityData.filter(row => row.security_status.includes('SEGURO')).length;
  const totalCount = securityData.length;
  const securityPercentage = totalCount > 0 ? Math.round((secureCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Segurança RLS</h1>
          <p className="text-neutral-300">
            Monitore o status de Row Level Security (RLS) em todas as tabelas
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {!error && securityPercentage < 100 && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {100 - securityPercentage}% das tabelas têm problemas de segurança. 
            Execute a migração de correção RLS para resolver.
          </AlertDescription>
        </Alert>
      )}

      {!error && securityPercentage === 100 && (
        <Alert className="bg-green-900/20 border-green-500/50 text-green-300">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Parabéns!</strong> Todas as tabelas estão protegidas com RLS adequado.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-viverblue" />
            Status de Segurança das Tabelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2 text-viverblue" />
              <p className="text-neutral-300">Verificando status de segurança...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p className="text-neutral-300 mb-4">Erro ao carregar dados de segurança</p>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Tentar novamente
              </Button>
            </div>
          ) : securityData.length > 0 ? (
            <SecurityStatusTable data={securityData} />
          ) : (
            <div className="text-center p-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-neutral-500" />
              <p className="text-neutral-300 mb-4">Nenhum dado de segurança disponível</p>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Sobre Row Level Security (RLS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">✅ Seguro</h4>
            <p className="text-sm text-neutral-300">
              Tabela tem RLS habilitado e políticas de segurança configuradas.
            </p>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">⚠️ RLS Desabilitado</h4>
            <p className="text-sm text-neutral-300">
              Tabela tem políticas RLS configuradas mas RLS está desabilitado. 
              Execute <code className="bg-neutral-800 px-2 py-1 rounded text-viverblue">ALTER TABLE ... ENABLE ROW LEVEL SECURITY;</code>
            </p>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-red-400 mb-2">🔴 Sem Proteção</h4>
            <p className="text-sm text-neutral-300">
              Tabela não tem RLS nem políticas de segurança. Dados podem estar expostos publicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
