
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Trash2,
  Database
} from 'lucide-react';
import { useRoleSync } from '@/hooks/admin/useRoleSync';

export const RoleSyncPanel = () => {
  const { 
    isLoading, 
    issues, 
    auditData, 
    syncResults,
    validateRoles, 
    auditRoles, 
    syncRoles, 
    runFullDiagnostic,
    clearResults
  } = useRoleSync();

  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  const handleOperation = async (operation: string, fn: () => Promise<any>) => {
    setActiveOperation(operation);
    try {
      await fn();
    } finally {
      setActiveOperation(null);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning' | 'info') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'warning' | 'info') => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const, 
      warning: 'secondary' as const,
      info: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ferramentas de Correção Sistêmica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleOperation('validate', validateRoles)}
              disabled={isLoading}
              variant="outline"
              className="flex-col h-auto p-4"
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Validar Roles</span>
              <span className="text-xs text-muted-foreground">Detectar inconsistências</span>
            </Button>

            <Button
              onClick={() => handleOperation('audit', auditRoles)}
              disabled={isLoading}
              variant="outline"
              className="flex-col h-auto p-4"
            >
              <Database className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Auditar Sistema</span>
              <span className="text-xs text-muted-foreground">Análise completa</span>
            </Button>

            <Button
              onClick={() => handleOperation('sync', syncRoles)}
              disabled={isLoading}
              variant="outline"
              className="flex-col h-auto p-4"
            >
              <RefreshCw className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Sincronizar</span>
              <span className="text-xs text-muted-foreground">Corrigir automaticamente</span>
            </Button>

            <Button
              onClick={() => handleOperation('diagnostic', runFullDiagnostic)}
              disabled={isLoading}
              className="flex-col h-auto p-4"
            >
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Diagnóstico Completo</span>
              <span className="text-xs text-muted-foreground">Análise + Validação</span>
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Executando {activeOperation}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados de Auditoria */}
      {auditData && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {auditData.total_users}
                </div>
                <div className="text-sm text-muted-foreground">Usuários Totais</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {auditData.inconsistencies_count}
                </div>
                <div className="text-sm text-muted-foreground">Inconsistências</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {auditData.users_without_roles}
                </div>
                <div className="text-sm text-muted-foreground">Usuários sem Role</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="font-medium mb-2">Distribuição por Roles:</h4>
              <div className="space-y-2">
                {Object.entries(auditData.user_count_by_role).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center py-1">
                    <span className="text-sm">{role}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Encontradas */}  
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Inconsistências Detectadas ({issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {issues.map((issue, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Role atual: {issue.user_role} → Esperado: {issue.expected_role_name}
                      </p>
                      <p className="text-xs text-red-600">Tipo: {issue.issue_type}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {issue.issue_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log de Operações */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Log de Operações</CardTitle>
            <Button
              onClick={clearResults}
              size="sm"
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{result.message}</p>
                      {getStatusBadge(result.status)}
                    </div>
                    {result.status !== 'info' && (
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Perfis: {result.total_profiles}</span>
                        <span>Corrigidos: {result.profiles_corrected}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
