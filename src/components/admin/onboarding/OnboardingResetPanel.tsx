
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { executeCompleteReset, resetAllOnboardingData, initializeOnboardingForAllUsers } from '@/utils/adminOnboardingReset';
import { toast } from 'sonner';

export const OnboardingResetPanel: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetResult, setLastResetResult] = useState<any>(null);

  const handleCompleteReset = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá DELETAR todos os dados de onboarding de TODOS os usuários e não pode ser desfeita. Tem certeza?')) {
      return;
    }

    if (!confirm('Confirme novamente: Deseja realmente resetar TODOS os dados de onboarding?')) {
      return;
    }

    try {
      setIsResetting(true);
      console.log('🚀 Iniciando reset completo do sistema...');
      
      const result = await executeCompleteReset();
      
      if (result.success) {
        setLastResetResult(result);
        toast.success('Reset completo realizado com sucesso!', {
          description: `${result.total_deleted} registros removidos, ${result.users_initialized} usuários inicializados`
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Erro no reset:', error);
      toast.error(`Erro no reset: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetOnly = async () => {
    if (!confirm('Deseja apenas limpar os dados existentes (sem reinicializar)?')) {
      return;
    }

    try {
      setIsResetting(true);
      const result = await resetAllOnboardingData();
      
      if (result.success) {
        setLastResetResult(result);
        toast.success('Dados removidos com sucesso!');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Erro no reset:', error);
      toast.error(`Erro no reset: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleInitializeOnly = async () => {
    try {
      setIsResetting(true);
      const result = await initializeOnboardingForAllUsers();
      
      if (result.success) {
        toast.success(`Onboarding inicializado para ${result.users_initialized} usuários`);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('❌ Erro na inicialização:', error);
      toast.error(`Erro na inicialização: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Reset do Sistema de Onboarding
        </CardTitle>
        <CardDescription>
          Ferramentas administrativas para resetar e reinicializar o sistema de onboarding
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>ATENÇÃO:</strong> Estas operações são irreversíveis e afetam todos os usuários. 
            Um backup automático será criado antes da operação.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleCompleteReset}
              disabled={isResetting}
              variant="destructive"
              className="h-auto py-4 px-6"
            >
              {isResetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              <div className="text-center">
                <div className="font-semibold">Reset Completo</div>
                <div className="text-xs opacity-90">Limpar + Reinicializar</div>
              </div>
            </Button>

            <Button
              onClick={handleResetOnly}
              disabled={isResetting}
              variant="outline"
              className="h-auto py-4 px-6"
            >
              {isResetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              <div className="text-center">
                <div className="font-semibold">Apenas Limpar</div>
                <div className="text-xs opacity-90">Remover dados existentes</div>
              </div>
            </Button>

            <Button
              onClick={handleInitializeOnly}
              disabled={isResetting}
              variant="outline"
              className="h-auto py-4 px-6"
            >
              {isResetting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              <div className="text-center">
                <div className="font-semibold">Apenas Inicializar</div>
                <div className="text-xs opacity-90">Criar registros vazios</div>
              </div>
            </Button>
          </div>

          {lastResetResult && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-green-600">Último Reset Realizado:</div>
                  <div className="text-sm">
                    <div>✅ {lastResetResult.message}</div>
                    {lastResetResult.total_deleted && (
                      <div>📊 Total de registros removidos: {lastResetResult.total_deleted}</div>
                    )}
                    {lastResetResult.users_initialized && (
                      <div>👥 Usuários inicializados: {lastResetResult.users_initialized}</div>
                    )}
                    {lastResetResult.backup_info && (
                      <div>💾 Backup criado: {lastResetResult.backup_info.backup_timestamp}</div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <div><strong>Reset Completo:</strong> Remove todos os dados existentes, cria backup automático e inicializa registros vazios para todos os usuários</div>
          <div><strong>Apenas Limpar:</strong> Remove apenas os dados existentes (útil para limpeza completa)</div>
          <div><strong>Apenas Inicializar:</strong> Cria registros vazios para usuários que não têm onboarding (sem remover dados existentes)</div>
        </div>
      </CardContent>
    </Card>
  );
};
