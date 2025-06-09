
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
  AlertCircle
} from 'lucide-react';
import { useRoleSync } from '@/hooks/admin/useRoleSync';

export const RoleSyncPanel = () => {
  const { 
    isLoading, 
    issues, 
    auditData, 
    validateRoles, 
    auditRoles, 
    syncRoles 
  } = useRoleSync();

  const [hasRunInitialCheck, setHasRunInitialCheck] = useState(false);

  useEffect(() => {
    // Executar verificação inicial automaticamente
    if (!hasRunInitialCheck) {
      const runInitialCheck = async () => {
        try {
          await Promise.all([validateRoles(), auditRoles()]);
          setHasRunInitialCheck(true);
        } catch (error) {
          console.error('Erro na verificação inicial:', error);
        }
      };
      
      runInitialCheck();
    }
  }, [hasRunInitialCheck, validateRoles, auditRoles]);

  const handleSyncRoles = async () => {
    try {
      await syncRoles();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
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
      {/* Painel de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status do Sistema de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total de Usuários */}
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{auditData?.total_users || 0}</div>
              <div className="text-sm text-muted-foreground">Total de Usuários</div>
            </div>

            {/* Inconsistências */}
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {auditData?.inconsistencies_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Inconsistências</div>
            </div>

            {/* Usuários sem Role */}
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-red-600">
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

      {/* Ações de Correção */}
      <Card>
        <CardHeader>
          <CardTitle>Correção Sistêmica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Corrigir Automaticamente ({issues.length})
              </Button>
            )}
          </div>

          {issues.length === 0 && hasRunInitialCheck && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Sistema de roles está íntegro! Nenhuma inconsistência encontrada.
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
              <AlertTriangle className="h-5 w-5 text-orange-600" />
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
