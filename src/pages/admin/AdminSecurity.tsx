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
          <h1 className="text-3xl font-bold tracking-tight">Segurança RLS</h1>
          <p className="text-muted-foreground">
            Monitore o status de Row Level Security (RLS) em todas as tabelas
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {!error && securityPercentage < 100 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {100 - securityPercentage}% das tabelas têm problemas de segurança. 
            Execute a migração de correção RLS para resolver.
          </AlertDescription>
        </Alert>
      )}

      {!error && securityPercentage === 100 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Parabéns!</strong> Todas as tabelas estão protegidas com RLS adequado.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Segurança das Tabelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <p>Verificando status de segurança...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-muted-foreground mb-4">Erro ao carregar dados de segurança</p>
              <Button onClick={handleRefresh} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : securityData.length > 0 ? (
            <SecurityStatusTable data={securityData} />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de segurança disponível</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre Row Level Security (RLS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">✅ Seguro</h4>
            <p className="text-sm text-muted-foreground">
              Tabela tem RLS habilitado e políticas de segurança configuradas.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">⚠️ RLS Desabilitado</h4>
            <p className="text-sm text-muted-foreground">
              Tabela tem políticas RLS configuradas mas RLS está desabilitado. 
              Execute <code>ALTER TABLE ... ENABLE ROW LEVEL SECURITY;</code>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-red-700 mb-2">🔴 Sem Proteção</h4>
            <p className="text-sm text-muted-foreground">
              Tabela não tem RLS nem políticas de segurança. Dados podem estar expostos publicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
