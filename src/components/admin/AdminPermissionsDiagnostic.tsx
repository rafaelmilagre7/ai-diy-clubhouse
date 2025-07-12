import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPermissionsDiagnostic = () => {
  const { user, profile, isAdmin, refreshProfile, validatePermissions } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<{
    isAdmin: boolean;
    profile: any;
    timestamp: string;
  } | null>(null);

  const handleValidatePermissions = async () => {
    setIsValidating(true);
    
    try {
      const result = await validatePermissions();
      setLastValidation({
        ...result,
        timestamp: new Date().toLocaleString()
      });
      
      if (result.isAdmin !== isAdmin) {
        toast.warning('Inconsistência detectada nas permissões!');
      } else {
        toast.success('Permissões validadas com sucesso');
      }
    } catch (error) {
      toast.error('Erro na validação de permissões');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      await refreshProfile();
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const getStatusBadge = (isAdminCurrent: boolean, isAdminValidated?: boolean) => {
    if (isAdminValidated === undefined) {
      return <Badge variant="outline">Não validado</Badge>;
    }
    
    if (isAdminCurrent === isAdminValidated) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Consistente
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Inconsistente
      </Badge>
    );
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Diagnóstico de Permissões Admin
        </CardTitle>
        <CardDescription>
          Ferramenta para diagnosticar e corrigir problemas de permissões administrativas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado Atual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Estado Atual (Frontend)</h4>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <strong>ID:</strong> {user?.id?.substring(0, 8)}***
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Role Name:</strong> {profile?.user_roles?.name || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Role Legacy:</strong> {profile?.role || 'N/A'}
              </p>
            </div>
          </div>
          
          {lastValidation && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Última Validação (Backend)</h4>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <strong>Timestamp:</strong> {lastValidation.timestamp}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>É Admin (DB):</strong> {lastValidation.isAdmin ? 'Sim' : 'Não'}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Status:</strong> {getStatusBadge(isAdmin, lastValidation.isAdmin)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ações de Diagnóstico */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleValidatePermissions} 
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Validar Permissões
          </Button>
          
          <Button 
            onClick={handleRefreshProfile} 
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar Perfil
          </Button>
        </div>

        {/* Informações de Debug */}
        {profile?.user_roles && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Debug - Dados do Role</h4>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify({
                role_id: profile.role_id,
                role_name: profile.user_roles.name,
                permissions: profile.user_roles.permissions,
                role_legacy: profile.role
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Status de Inconsistência */}
        {lastValidation && lastValidation.isAdmin !== isAdmin && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Inconsistência Detectada</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              O estado do frontend não está sincronizado com o banco de dados. 
              Tente recarregar o perfil ou fazer logout/login.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};