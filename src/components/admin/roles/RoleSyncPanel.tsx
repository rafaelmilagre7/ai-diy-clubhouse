
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Shield,
  AlertCircle,
  PlayCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useRoleSync } from '@/hooks/admin/useRoleSync';

export const RoleSyncPanel = () => {
  const { 
    isLoading, 
    issues, 
    auditData, 
    hasHealthCheck,
    validateRoles, 
    auditRoles, 
    syncRoles,
    runFullDiagnostic,
    checkSystemHealth
  } = useRoleSync();

  const [hasRunInitialCheck, setHasRunInitialCheck] = useState(false);
  const [showMigrationSuccess, setShowMigrationSuccess] = useState(true);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar saúde do sistema primeiro, depois executar diagnóstico se seguro
    if (!hasRunInitialCheck) {
      const runInitialCheck = async () => {
        try {
          // Verificar saúde do sistema primeiro
          const isHealthy = await checkSystemHealth();
          setSystemHealthy(isHealthy);
          
          if (isHealthy) {
            // Diagnóstico executado
            await runFullDiagnostic();
          }
          
          setHasRunInitialCheck(true);
        } catch (error) {
          console.error('Erro na verificação inicial:', error);
          setSystemHealthy(false);
          setHasRunInitialCheck(true); // Marcar como executado mesmo com erro
        }
      };
      
      // Executar com delay para evitar múltiplas chamadas
      const timeoutId = setTimeout(runInitialCheck, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [hasRunInitialCheck, runFullDiagnostic, checkSystemHealth]);

  const handleSyncRoles = async () => {
    try {
      await syncRoles();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  const handleRunDiagnostic = async () => {
    try {
      await runFullDiagnostic();
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    }
  };

  const getIssueTypeLabel = (issueType: string) => {
    switch (issueType) {
      case 'missing_role':
        return 'Role ausente';
      case 'missing_role_id':
        return 'Role ID ausente';
      case 'role_mismatch':
        return 'Inconsistência de role';
      case 'both_null':
        return 'Sem role definido';
      default:
        return issueType;
    }
  };

  const getIssueVariant = (issueType: string) => {
    switch (issueType) {
      case 'missing_role':
      case 'missing_role_id':
        return 'destructive' as const;
      case 'role_mismatch':
        return 'destructive' as const;
      case 'both_null':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Sucesso da Migration */}
      {showMigrationSuccess && (
        <Alert className="border-system-healthy/20 bg-system-healthy/10">
          <CheckCircle2 className="h-4 w-4 text-system-healthy" />
          <AlertDescription className="text-system-healthy">
            <div className="flex items-center justify-between">
              <span>
                ✅ Sistema atualizado com sucesso! As funções SQL foram recriadas para resolver problemas de cache.
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMigrationSuccess(false)}
                className="text-system-healthy hover:text-system-healthy/80"
              >
                ✕
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Painel de Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Sistema de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status de Saúde do Sistema */}
          {systemHealthy !== null && (
            <div className="mb-4 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                {systemHealthy ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-system-healthy" />
                    <span className="text-system-healthy font-medium">Sistema Operacional</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-status-warning" />
                    <span className="text-status-warning font-medium">Sistema Instável - Operações limitadas</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total de Usuários */}
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto text-status-info mb-2" />
              <div className="text-2xl font-bold">{auditData?.total_users || 0}</div>
              <div className="text-sm text-muted-foreground">Total de Usuários</div>
            </div>

            {/* Inconsistências */}
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto text-status-warning mb-2" />
              <div className="text-2xl font-bold text-status-warning">
                {auditData?.inconsistencies_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Inconsistências</div>
            </div>

            {/* Usuários sem Role */}
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-status-error mb-2" />
              <div className="text-2xl font-bold text-status-error">
                {auditData?.users_without_roles || 0}
              </div>
              <div className="text-sm text-muted-foreground">Sem Roles</div>
            </div>
          </div>

          {/* Distribuição por Role */}
          {auditData?.user_count_by_role && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Distribuição por Role:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(auditData.user_count_by_role).map(([role, count]) => (
                  <Badge key={role} variant="outline" className="px-3 py-1">
                    {role}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Painel de Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ferramentas de Diagnóstico e Correção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRunDiagnostic} 
              disabled={isLoading}
              variant="default"
            >
              <PlayCircle className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Diagnóstico Completo
            </Button>

            <Button 
              onClick={validateRoles} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Validar Roles
            </Button>

            <Button 
              onClick={auditRoles} 
              disabled={isLoading}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auditar Sistema
            </Button>

            {issues.length > 0 && (
              <Button 
                onClick={handleSyncRoles} 
                disabled={isLoading}
                className="bg-status-warning hover:bg-status-warning-dark"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Corrigir Automaticamente ({issues.length})
              </Button>
            )}
          </div>

          {/* Status do Sistema */}
          {issues.length === 0 && hasRunInitialCheck && !isLoading && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Sistema de roles está íntegro! Nenhuma inconsistência encontrada.
              </AlertDescription>
            </Alert>
          )}

          {/* Indicador de carregamento */}
          {isLoading && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Executando operações no sistema de roles...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Inconsistências */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
              Inconsistências Detectadas ({issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{issue.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Role atual: {issue.user_role || 'Nenhum'} | 
                      Role esperado: {issue.expected_role_name || 'Nenhum'}
                    </div>
                    {issue.user_role_id && (
                      <div className="text-xs text-muted-foreground">
                        ID: {issue.user_role_id}
                      </div>
                    )}
                  </div>
                  <Badge variant={getIssueVariant(issue.issue_type)}>
                    {getIssueTypeLabel(issue.issue_type)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
