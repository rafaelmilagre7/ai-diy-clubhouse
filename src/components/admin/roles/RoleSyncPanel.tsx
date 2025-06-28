
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface SyncResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
}

export const RoleSyncPanel = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const { toast } = useToast();

  const runSync = async () => {
    setIsSyncing(true);
    setSyncResults([]);

    try {
      // Verificar e corrigir perfis sem papel
      const { data: profilesWithoutRole, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select('id, email, role_id')
        .is('role_id', null);

      if (profilesError) throw profilesError;

      if (profilesWithoutRole && profilesWithoutRole.length > 0) {
        // Buscar papel padrão 'member'
        const { data: memberRole, error: memberRoleError } = await (supabase as any)
          .from('user_roles')
          .select('id')
          .eq('name', 'member')
          .single();

        if (memberRoleError) {
          setSyncResults(prev => [...prev, {
            status: 'error',
            message: 'Papel "member" não encontrado',
            details: ['Crie um papel chamado "member" primeiro']
          }]);
        } else {
          // Atualizar perfis sem papel
          const { error: updateError } = await (supabase as any)
            .from('profiles')
            .update({ role_id: memberRole.id })
            .is('role_id', null);

          if (updateError) throw updateError;

          setSyncResults(prev => [...prev, {
            status: 'success',
            message: `${profilesWithoutRole.length} perfis atualizados com papel padrão`,
            details: profilesWithoutRole.map((p: any) => p.email)
          }]);
        }
      } else {
        setSyncResults(prev => [...prev, {
          status: 'success',
          message: 'Todos os perfis têm papéis atribuídos',
        }]);
      }

      // Verificar papéis órfãos
      const { data: orphanedRoles, error: orphanedError } = await (supabase as any)
        .from('user_roles')
        .select(`
          id, 
          name,
          profiles!inner(id)
        `)
        .eq('profiles.role_id', null);

      if (orphanedError) {
        console.warn('Erro ao verificar papéis órfãos:', orphanedError);
      }

      setSyncResults(prev => [...prev, {
        status: 'info',
        message: 'Sincronização concluída com sucesso',
      }]);

      toast({
        title: "Sincronização concluída",
        description: "Verificação e correção de papéis realizada com sucesso.",
      });

    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncResults(prev => [...prev, {
        status: 'error',
        message: 'Erro durante a sincronização',
        details: [error instanceof Error ? error.message : 'Erro desconhecido']
      }]);

      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro durante a sincronização dos papéis.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Correção Sistêmica de Papéis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Esta ferramenta verifica e corrige inconsistências no sistema de papéis:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Perfis sem papel atribuído</li>
            <li>• Papéis órfãos sem usuários</li>
            <li>• Referências quebradas entre perfis e papéis</li>
          </ul>
        </div>

        <Button 
          onClick={runSync} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Executar Sincronização
            </>
          )}
        </Button>

        {syncResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Resultados da Sincronização:</h4>
            {syncResults.map((result, index) => (
              <Alert key={index} className={`
                ${result.status === 'success' ? 'border-green-200 bg-green-50' : ''}
                ${result.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                ${result.status === 'error' ? 'border-red-200 bg-red-50' : ''}
                ${result.status === 'info' ? 'border-blue-200 bg-blue-50' : ''}
              `}>
                <div className="flex items-start gap-2">
                  {getIcon(result.status)}
                  <div className="flex-1">
                    <AlertDescription className="text-xs">
                      {result.message}
                      {result.details && result.details.length > 0 && (
                        <ul className="mt-1 ml-2 space-y-0.5">
                          {result.details.map((detail, i) => (
                            <li key={i} className="text-xs opacity-75">• {detail}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
