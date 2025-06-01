
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Database, Users, Network, Bell } from 'lucide-react';
import { clearAllNetworkingData, type NetworkingResetResult } from '@/utils/adminNetworkingReset';
import { toast } from 'sonner';

export const NetworkingResetPanel: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetResult, setLastResetResult] = useState<NetworkingResetResult | null>(null);

  const handleResetConfirm = async () => {
    setIsResetting(true);
    
    try {
      const result = await clearAllNetworkingData();
      setLastResetResult(result);
      
      if (result.success) {
        toast.success('Limpeza global do networking concluída!');
      } else {
        toast.error(`Erro na limpeza: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao executar reset:', error);
      toast.error('Erro inesperado durante a limpeza');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Reset Global do Networking</h3>
            <p className="text-sm text-muted-foreground">
              Limpa todos os dados de networking da plataforma
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              ⚠️ ATENÇÃO: Ação Irreversível
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Esta operação irá deletar TODOS os dados de networking de TODOS os usuários da plataforma.
              Um backup será criado automaticamente antes da exclusão.
            </p>
          </div>
        </div>

        {/* Dados que serão limpos */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados que serão removidos:
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <Network className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Todos os matches</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm">Todas as conexões</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Preferências de networking</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <Bell className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Notificações de conexão</span>
            </div>
          </div>
        </div>

        {/* Resultado da última limpeza */}
        {lastResetResult && (
          <div className="space-y-3">
            <h4 className="font-medium">Última Limpeza:</h4>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={lastResetResult.success ? "default" : "destructive"}>
                  {lastResetResult.success ? "Sucesso" : "Erro"}
                </Badge>
                {lastResetResult.backup_timestamp && (
                  <Badge variant="outline">
                    Backup: {lastResetResult.backup_timestamp}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {lastResetResult.message}
              </p>
              {lastResetResult.clearedData && (
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>Matches: {lastResetResult.clearedData.matches}</div>
                  <div>Conexões: {lastResetResult.clearedData.connections}</div>
                  <div>Preferências: {lastResetResult.clearedData.preferences}</div>
                  <div>Notificações: {lastResetResult.clearedData.notifications}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão de Reset */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Executando Limpeza...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Executar Limpeza Global
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Limpeza Global
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Você está prestes a <strong>deletar TODOS os dados de networking</strong> de todos os usuários da plataforma.
                </p>
                <p>
                  Esta ação é <strong>irreversível</strong> e irá:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Remover todos os matches de networking</li>
                  <li>Deletar todas as conexões entre usuários</li>
                  <li>Limpar preferências de networking</li>
                  <li>Remover notificações de conexão</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Um backup será criado automaticamente antes da exclusão.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Sim, Executar Limpeza
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Instruções adicionais */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• A função também está disponível no console: <code>window.clearAllNetworking()</code></p>
          <p>• Após a limpeza, os usuários precisarão completar o onboarding para acessar o networking</p>
          <p>• Novos matches só serão gerados após onboarding completo</p>
        </div>
      </div>
    </Card>
  );
};
