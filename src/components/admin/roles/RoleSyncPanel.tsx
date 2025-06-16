
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RoleAuditData {
  user_count_by_role: Record<string, number>;
  inconsistencies_count: number;
  total_users: number;
  roles_without_users: string[];
  users_without_roles: number;
}

export const RoleSyncPanel: React.FC = () => {
  const [auditData, setAuditData] = useState<RoleAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runRoleAudit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [ROLE-SYNC] Executando auditoria de roles...');
      
      // Usar a função corrigida
      const { data, error } = await supabase.rpc('audit_role_assignments');
      
      if (error) {
        console.error('❌ [ROLE-SYNC] Erro na auditoria:', error);
        setError(error.message);
        toast.error(`Erro na auditoria: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        const result = data[0];
        setAuditData({
          user_count_by_role: result.user_count_by_role || {},
          inconsistencies_count: result.inconsistencies_count || 0,
          total_users: result.total_users || 0,
          roles_without_users: result.roles_without_users || [],
          users_without_roles: result.users_without_roles || 0
        });
        
        console.log('✅ [ROLE-SYNC] Auditoria concluída:', result);
        
        if (result.inconsistencies_count > 0) {
          toast.warning(`Encontradas ${result.inconsistencies_count} inconsistências`);
        } else {
          toast.success('Sistema de roles está consistente');
        }
      }
      
    } catch (err: any) {
      console.error('❌ [ROLE-SYNC] Erro na execução:', err);
      setError(err.message || 'Erro desconhecido');
      toast.error('Erro ao executar auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  const hasIssues = auditData && (
    auditData.inconsistencies_count > 0 || 
    auditData.users_without_roles > 0 || 
    auditData.roles_without_users.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-viverblue" />
            Auditoria de Roles e Permissões
          </CardTitle>
          <Button 
            onClick={runRoleAudit} 
            disabled={isLoading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Auditando...' : 'Executar Auditoria'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {auditData && (
          <>
            {/* Status Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 border border-neutral-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-300">Total de Usuários</p>
                    <p className="text-2xl font-bold text-white">{auditData.total_users}</p>
                  </div>
                  <Users className="h-8 w-8 text-viverblue" />
                </div>
              </div>
              
              <div className={`border p-4 rounded-lg ${
                auditData.inconsistencies_count > 0 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-green-900/20 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      auditData.inconsistencies_count > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      Inconsistências
                    </p>
                    <p className={`text-2xl font-bold ${
                      auditData.inconsistencies_count > 0 ? 'text-red-300' : 'text-green-300'
                    }`}>
                      {auditData.inconsistencies_count}
                    </p>
                  </div>
                  {auditData.inconsistencies_count > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  )}
                </div>
              </div>
              
              <div className={`border p-4 rounded-lg ${
                auditData.users_without_roles > 0 
                  ? 'bg-yellow-900/20 border-yellow-500/30' 
                  : 'bg-green-900/20 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      auditData.users_without_roles > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      Usuários sem Role
                    </p>
                    <p className={`text-2xl font-bold ${
                      auditData.users_without_roles > 0 ? 'text-yellow-300' : 'text-green-300'
                    }`}>
                      {auditData.users_without_roles}
                    </p>
                  </div>
                  {auditData.users_without_roles > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Distribuição por Roles */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Distribuição de Usuários por Role</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(auditData.user_count_by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-neutral-800/30 border border-neutral-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white capitalize">{role.replace('_', ' ')}</p>
                      <p className="text-sm text-neutral-400">{count} usuários</p>
                    </div>
                    <Badge variant="outline" className="border-viverblue text-viverblue">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles não utilizadas */}
            {auditData.roles_without_users.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Roles sem Usuários</h4>
                <div className="flex flex-wrap gap-2">
                  {auditData.roles_without_users.map((role) => (
                    <Badge key={role} variant="outline" className="border-yellow-500 text-yellow-400">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Status final */}
            {!hasIssues && (
              <Alert className="bg-green-900/20 border-green-500/50 text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sistema Consistente:</strong> Não foram encontradas inconsistências no sistema de roles.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {!auditData && !isLoading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-neutral-500" />
            <p className="text-neutral-300 mb-4">Execute uma auditoria para verificar o status do sistema de roles</p>
            <Button 
              onClick={runRoleAudit} 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Iniciar Auditoria
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
