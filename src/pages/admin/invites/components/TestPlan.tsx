
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Play, Trash2, Mail, ExternalLink } from 'lucide-react';
import { useInviteCreate } from '@/hooks/admin/invites/useInviteCreate';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { toast } from 'sonner';

interface TestStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
}

export const TestPlan: React.FC = () => {
  const { createInvite, isCreating } = useInviteCreate();
  const { deleteUser, isDeleting } = useDeleteUser();
  
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 'delete-user',
      title: 'Etapa 1: Deletar Usuário Existente',
      description: 'Remover rafaelkinojo@gmail.com do sistema se existir',
      status: 'pending'
    },
    {
      id: 'create-invite',
      title: 'Etapa 2: Criar Novo Convite',
      description: 'Criar convite para rafaelkinojo@gmail.com com sistema híbrido',
      status: 'pending'
    },
    {
      id: 'monitor-logs',
      title: 'Etapa 3: Monitorar Logs',
      description: 'Acompanhar logs da Edge Function em tempo real',
      status: 'pending'
    },
    {
      id: 'verify-delivery',
      title: 'Etapa 4: Verificar Entrega',
      description: 'Confirmar recebimento do email e funcionamento do link',
      status: 'pending'
    }
  ]);
  
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const updateStepStatus = (stepId: string, status: TestStep['status'], details?: string) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, details } : step
    ));
  };

  const executeStep1 = async () => {
    setCurrentTest('delete-user');
    updateStepStatus('delete-user', 'running', 'Procurando e deletando usuário...');
    
    try {
      // Simular ID do usuário (em produção você buscaria pelo email)
      const testUserId = 'test-user-id'; // Substitua pelo ID real se necessário
      const testEmail = 'rafaelkinojo@gmail.com';
      
      await deleteUser(testUserId, testEmail);
      
      updateStepStatus('delete-user', 'completed', 'Usuário removido do sistema (se existia)');
      toast.success('Etapa 1 concluída', {
        description: 'Sistema limpo para novo teste'
      });
      
      setTestResults(prev => ({
        ...prev,
        deleteUser: { success: true, timestamp: new Date() }
      }));
      
    } catch (error: any) {
      updateStepStatus('delete-user', 'failed', `Erro: ${error.message}`);
      toast.error('Falha na Etapa 1', {
        description: 'Continuando mesmo assim...'
      });
    } finally {
      setCurrentTest(null);
    }
  };

  const executeStep2 = async () => {
    setCurrentTest('create-invite');
    updateStepStatus('create-invite', 'running', 'Criando convite com sistema híbrido...');
    
    try {
      // Buscar ID do papel "member" (você pode ajustar conforme necessário)
      const memberRoleId = 'role-member-id'; // Substitua pelo ID real do papel
      
      const result = await createInvite(
        'rafaelkinojo@gmail.com',
        memberRoleId,
        'Teste completo do sistema híbrido Supabase + Resend',
        '7 days'
      );
      
      if (result) {
        updateStepStatus('create-invite', 'completed', 
          `Convite criado: ${result.invite_id} | Status: ${result.emailStatus}`
        );
        
        setTestResults(prev => ({
          ...prev,
          createInvite: { 
            success: true, 
            inviteId: result.invite_id,
            emailStatus: result.emailStatus,
            timestamp: new Date()
          }
        }));
        
        toast.success('Etapa 2 concluída', {
          description: 'Convite criado e processado pelo sistema híbrido'
        });
        
        // Auto-avançar para monitoramento
        setTimeout(() => {
          updateStepStatus('monitor-logs', 'running', 'Verifique os logs da Edge Function...');
        }, 1000);
        
      } else {
        throw new Error('Falha ao criar convite');
      }
      
    } catch (error: any) {
      updateStepStatus('create-invite', 'failed', `Erro: ${error.message}`);
      toast.error('Falha na Etapa 2', {
        description: error.message
      });
    } finally {
      setCurrentTest(null);
    }
  };

  const markStep3Complete = () => {
    updateStepStatus('monitor-logs', 'completed', 'Logs verificados - sistema funcionando');
    updateStepStatus('verify-delivery', 'running', 'Aguardando verificação manual...');
    
    toast.info('Etapa 3 marcada como concluída', {
      description: 'Agora verifique se o email chegou'
    });
  };

  const markStep4Complete = () => {
    updateStepStatus('verify-delivery', 'completed', 'Email entregue e link funcionando');
    
    toast.success('🎉 Teste completo finalizado!', {
      description: 'Sistema híbrido de convites validado com sucesso'
    });
  };

  const resetTest = () => {
    setTestSteps(prev => prev.map(step => ({ ...step, status: 'pending', details: undefined })));
    setTestResults({});
    setCurrentTest(null);
    
    toast.info('Teste resetado', {
      description: 'Pronto para executar novamente'
    });
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestStep['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;
    
    const colors = {
      pending: 'text-gray-600',
      running: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status === 'pending' && 'Pendente'}
        {status === 'running' && 'Executando'}
        {status === 'completed' && 'Concluído'}
        {status === 'failed' && 'Falhou'}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            🧪 Plano de Teste - Sistema Híbrido de Convites
          </CardTitle>
          <Button
            onClick={resetTest}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🔄 Reset Teste
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email de Teste */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            📧 <strong>Email de Teste:</strong> rafaelkinojo@gmail.com
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Sistema: Supabase Auth → Fallback Resend (viverdeia.ai verificado)
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {testSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  {getStatusBadge(step.status)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                
                {step.details && (
                  <div className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded border">
                    {step.details}
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                {step.id === 'delete-user' && step.status === 'pending' && (
                  <Button
                    onClick={executeStep1}
                    disabled={isDeleting || currentTest !== null}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isDeleting ? 'Deletando...' : 'Executar'}
                  </Button>
                )}
                
                {step.id === 'create-invite' && step.status === 'pending' && (
                  <Button
                    onClick={executeStep2}
                    disabled={isCreating || currentTest !== null}
                    size="sm"
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {isCreating ? 'Criando...' : 'Executar'}
                  </Button>
                )}
                
                {step.id === 'monitor-logs' && step.status === 'running' && (
                  <Button
                    onClick={markStep3Complete}
                    size="sm"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Logs OK
                  </Button>
                )}
                
                {step.id === 'verify-delivery' && step.status === 'running' && (
                  <Button
                    onClick={markStep4Complete}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Email OK
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resultados */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              📊 Resultados do Teste
            </h4>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            📝 Instruções
          </h4>
          <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>1. Execute as etapas em ordem</li>
            <li>2. Monitore os logs da Edge Function durante a Etapa 3</li>
            <li>3. Verifique sua caixa de entrada após a Etapa 2</li>
            <li>4. Teste o link do convite quando receber o email</li>
            <li>5. Confirme se o processo de registro funciona</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
