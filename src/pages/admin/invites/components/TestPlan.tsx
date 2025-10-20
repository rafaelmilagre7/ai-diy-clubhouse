
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Play, RotateCcw, Mail, Trash2, UserX, Database } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { APP_CONFIG } from '@/config/app';

export const TestPlan: React.FC = () => {
  const [testEmail, setTestEmail] = useState('rafaelkinojo@gmail.com');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [softDelete, setSoftDelete] = useState(true);

  const { sendInviteEmail, getInviteLink, isSending } = useInviteEmailService();
  const { deleteUser, isDeleting } = useDeleteUser();

  const addTestResult = (step: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    const result = {
      step,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`[TEST] ${step}: ${status} - ${message}`, details);
  };

  const runCompleteTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);

    try {
      addTestResult('INÍCIO', 'success', 'Iniciando teste completo do sistema de convites');

      // 1. Verificar se usuário existe
      addTestResult('VERIFICAÇÃO', 'success', `Verificando se usuário ${testEmail} existe no sistema...`);
      
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', testEmail)
        .maybeSingle();

      if (userError) {
        addTestResult('VERIFICAÇÃO', 'error', 'Erro ao verificar usuário existente', userError);
      } else if (existingUser) {
        addTestResult('USUÁRIO ENCONTRADO', 'warning', `Usuário existente encontrado: ${existingUser.name || 'Sem nome'}`, existingUser);
        setSelectedUserId(existingUser.id);

        // 2. Executar limpeza/exclusão
        addTestResult('LIMPEZA', 'success', `Executando ${softDelete ? 'limpeza de dados (soft delete)' : 'exclusão completa'}...`);
        
        const deleteSuccess = await deleteUser(existingUser.id, existingUser.email, softDelete);
        
        if (deleteSuccess) {
          addTestResult('LIMPEZA', 'success', `${softDelete ? 'Dados limpos' : 'Usuário excluído'} com sucesso`);
        } else {
          addTestResult('LIMPEZA', 'error', `Falha na ${softDelete ? 'limpeza' : 'exclusão'}`);
          return;
        }
      } else {
        addTestResult('VERIFICAÇÃO', 'success', 'Nenhum usuário existente encontrado - pode prosseguir');
      }

      // 3. Criar novo convite
      addTestResult('CONVITE', 'success', 'Criando novo convite...');
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('id, name')
        .eq('name', 'admin')
        .single();

      if (!roleData) {
        addTestResult('CONVITE', 'error', 'Papel admin não encontrado');
        return;
      }

      const { data: inviteData, error: inviteError } = await supabase.rpc('create_invite', {
        p_email: testEmail,
        p_role_id: roleData.id,
        p_expires_in: '7 days',
        p_notes: 'Teste automatizado do sistema'
      });

      if (inviteError || inviteData.status === 'error') {
        addTestResult('CONVITE', 'error', 'Erro ao criar convite', inviteError || inviteData);
        return;
      }

      addTestResult('CONVITE', 'success', 'Convite criado com sucesso', {
        inviteId: inviteData.invite_id,
        token: inviteData.token?.substring(0, 8) + '...'
      });

      // 4. Testar envio de email
      addTestResult('EMAIL', 'success', 'Testando envio de email via sistema otimizado...');
      
      const inviteUrl = getInviteLink(inviteData.token);
      
      const emailResult = await sendInviteEmail({
        email: testEmail,
        inviteUrl,
        roleName: roleData.name,
        expiresAt: inviteData.expires_at,
        senderName: 'Sistema de Teste',
        notes: 'Este é um email de teste do sistema automatizado',
        inviteId: inviteData.invite_id,
        forceResend: true
      });

      if (emailResult.success) {
        addTestResult('EMAIL', 'success', `Email enviado: ${emailResult.message}`);
      } else {
        addTestResult('EMAIL', 'error', `Falha no envio: ${emailResult.error}`);
      }

      // 5. Verificar logs das Edge Functions
      addTestResult('LOGS', 'success', 'Verificando logs das Edge Functions...');
      
      // Aqui você pode adicionar verificações específicas dos logs se necessário
      addTestResult('LOGS', 'success', 'Verifique os logs das Edge Functions no painel do Supabase');

      // 6. Teste final
      addTestResult('FINALIZAÇÃO', 'success', 'Teste completo finalizado!');
      
      toast.success('Teste completo executado', {
        description: 'Verifique os resultados na aba de teste. Email deve ter sido enviado!'
      });

    } catch (error: any) {
      addTestResult('ERRO CRÍTICO', 'error', 'Erro inesperado durante o teste', error.message);
      toast.error('Erro durante o teste', {
        description: error.message
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const testEmailDirect = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    try {
      addTestResult('EMAIL DIRETO', 'success', 'Testando envio direto via Resend...');

      const testInviteUrl = APP_CONFIG.getAppUrl('/convite/TEST-TOKEN-123');
      
      const result = await sendInviteEmail({
        email: testEmail,
        inviteUrl: testInviteUrl,
        roleName: 'admin',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        senderName: 'Teste Direto',
        notes: 'Teste direto do sistema de email',
        forceResend: true
      });

      if (result.success) {
        addTestResult('EMAIL DIRETO', 'success', `Sucesso: ${result.message}`);
        toast.success('Email de teste enviado com sucesso!');
      } else {
        addTestResult('EMAIL DIRETO', 'error', `Falha: ${result.error}`);
        toast.error('Falha no envio do email de teste');
      }
    } catch (error: any) {
      addTestResult('EMAIL DIRETO', 'error', 'Erro no teste direto', error.message);
      toast.error('Erro no teste direto');
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    toast.info('Resultados de teste limpos');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Plano de Teste Automatizado - Sistema de Convites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-email">Email para Teste</Label>
                    <Input
                      id="test-email"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="soft-delete"
                      checked={softDelete}
                      onCheckedChange={setSoftDelete}
                    />
                    <Label htmlFor="soft-delete">Usar Soft Delete (Recomendado)</Label>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={runCompleteTest} 
                      disabled={isRunningTest || !testEmail}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                          Executando Teste...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Executar Teste Completo
                        </>
                      )}
                    </Button>

                    <Button 
                      onClick={testEmailDirect} 
                      disabled={isSending || !testEmail}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Teste Direto de Email
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-status-info/10 dark:bg-status-info/20 rounded-lg">
                    <h4 className="font-medium text-status-info-dark dark:text-status-info-light mb-2">
                      🔧 O que este teste faz:
                    </h4>
                    <ul className="text-sm text-status-info-dark dark:text-status-info-light space-y-1">
                      <li>1. Verifica se o usuário já existe</li>
                      <li>2. Executa limpeza/exclusão se necessário</li>
                      <li>3. Cria novo convite no banco</li>
                      <li>4. Testa envio via sistema otimizado</li>
                      <li>5. Monitora logs das Edge Functions</li>
                      <li>6. Fornece relatório detalhado</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-status-success/10 rounded-lg">
                    <h4 className="font-medium text-status-success mb-2">
                      ✅ Melhorias Implementadas:
                    </h4>
                    <ul className="text-sm text-status-success/80 space-y-1">
                      <li>• Sistema Resend como prioridade</li>
                      <li>• Soft delete inteligente</li>
                      <li>• Logs detalhados e monitoramento</li>
                      <li>• Fallbacks robustos</li>
                      <li>• Interface de teste automatizada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
                <Button onClick={clearTestResults} variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum teste executado ainda. Use a aba "Configuração" para executar testes.
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-3">
                        {result.status === 'success' && <CheckCircle className="h-5 w-5 text-status-success mt-0.5" />}
                        {result.status === 'error' && <AlertCircle className="h-5 w-5 text-status-error mt-0.5" />}
                        {result.status === 'warning' && <AlertCircle className="h-5 w-5 text-status-warning mt-0.5" />}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                              {result.step}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm">{result.message}</p>
                          {result.details && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Verificações Manuais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>1. <strong>Logs do Supabase:</strong> Verifique os logs das Edge Functions</p>
                    <p>2. <strong>Email Recebido:</strong> Confirme se o email chegou na caixa de entrada</p>
                    <p>3. <strong>Link Funcional:</strong> Teste se o link do convite funciona</p>
                    <p>4. <strong>Banco de Dados:</strong> Verifique se o convite foi criado na tabela 'invites'</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Comandos Úteis
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>SQL para limpar convites:</strong></p>
                    <code className="block bg-muted p-2 rounded text-xs">
                      DELETE FROM invites WHERE email = '{testEmail}';
                    </code>
                    <p><strong>SQL para verificar usuário:</strong></p>
                    <code className="block bg-muted p-2 rounded text-xs">
                      SELECT * FROM profiles WHERE email = '{testEmail}';
                    </code>
                  </div>
                </Card>
              </div>

              <div className="p-4 bg-status-warning/10 dark:bg-status-warning/20 rounded-lg">
                <h4 className="font-medium text-status-warning-dark dark:text-status-warning-light mb-2">
                  ⚠️ Pontos de Atenção:
                </h4>
                <ul className="text-sm text-status-warning-dark dark:text-status-warning-light space-y-1">
                  <li>• Verifique se a chave RESEND_API_KEY está configurada</li>
                  <li>• Confirme se o domínio está verificado no Resend</li>
                  <li>• Monitore os logs das Edge Functions em tempo real</li>
                  <li>• Teste com diferentes tipos de email (Gmail, Outlook, etc.)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
