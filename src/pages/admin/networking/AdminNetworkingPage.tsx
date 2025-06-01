
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { NetworkingResetPanel } from '@/components/admin/networking/NetworkingResetPanel';
import { Button } from '@/components/ui/button';
import { Network, Users, Database, Activity } from 'lucide-react';
import { useRunScheduledNetworkingGeneration } from '@/hooks/networking/useNetworkingAdmin';
import { toast } from 'sonner';

const AdminNetworkingPage = () => {
  const { profile } = useAuth();
  const runScheduled = useRunScheduledNetworkingGeneration();

  const handleRunScheduledGeneration = async () => {
    try {
      await runScheduled.mutateAsync();
      toast.success('Geração programada executada com sucesso!');
    } catch (error) {
      console.error('Erro na geração programada:', error);
      toast.error('Erro ao executar geração programada');
    }
  };

  // Verificar se é admin
  if (profile?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="h-6 w-6 text-viverblue" />
          Administração do Networking
        </h1>
        <p className="text-muted-foreground">
          Ferramentas administrativas para gerenciar o sistema de networking
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Network className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Sistema Limpo</p>
              <p className="text-xs text-muted-foreground">
                Networking bloqueado até onboarding completo
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Acesso Restrito</p>
              <p className="text-xs text-muted-foreground">
                Apenas usuários com onboarding completo
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Estado Preparado</p>
              <p className="text-xs text-muted-foreground">
                Plataforma 100% configurada
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ferramentas Administrativas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reset Global */}
        <NetworkingResetPanel />

        {/* Outras Ferramentas */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ferramentas de Geração</h3>
                <p className="text-sm text-muted-foreground">
                  Executar geração programada de matches
                </p>
              </div>
            </div>

            <Button 
              onClick={handleRunScheduledGeneration}
              disabled={runScheduled.isPending}
              className="w-full"
            >
              {runScheduled.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Executando...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Executar Geração Programada
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Gera matches para usuários com onboarding completo</p>
              <p>• Respeita limites mensais (5 clientes, 3 fornecedores)</p>
              <p>• Usa IA para análise de compatibilidade</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Estado Atual da Plataforma</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✅ <strong>Networking bloqueado</strong> para usuários sem onboarding completo</p>
          <p>✅ <strong>Limpeza automática</strong> de matches para usuários com onboarding incompleto</p>
          <p>✅ <strong>Validação rigorosa</strong> de acesso em todos os pontos</p>
          <p>✅ <strong>Geração controlada</strong> apenas para usuários qualificados</p>
          <p>✅ <strong>Função de reset global</strong> disponível para limpeza completa</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminNetworkingPage;
