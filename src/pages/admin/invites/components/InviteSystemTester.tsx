
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Mail,
  Send
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRoles } from '@/hooks/admin/useRoles';

export default function InviteSystemTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('teste@exemplo.com');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: any;
  } | null>(null);

  const { roles, loading: rolesLoading } = useRoles();

  // Auto-selecionar primeiro papel válido
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const adminRole = roles.find(role => role.name.toLowerCase().includes('admin'));
      const firstRole = adminRole || roles[0];
      setSelectedRoleId(firstRole.id);
    }
  }, [roles, selectedRoleId]);

  const runSystemTest = async () => {
    if (!selectedRoleId) {
      setTestResult({
        status: 'error',
        message: 'Selecione um papel para o teste'
      });
      return;
    }

    setIsRunning(true);
    const testId = crypto.randomUUID().substring(0, 8);
    
    try {
      console.log(`🧪 [TEST-${testId}] === INICIANDO TESTE COMPLETO ===`);
      console.log(`📧 Email: ${testEmail}`);
      console.log(`👤 Papel: ${selectedRoleId}`);

      // ETAPA 1: Criar convite de teste
      console.log(`🔍 [TEST-${testId}] Criando convite de teste...`);
      const { data: createResult, error: createError } = await supabase.rpc('create_invite', {
        p_email: testEmail,
        p_role_id: selectedRoleId,
        p_expires_in: '1 hour',
        p_notes: `Teste automático do sistema - ${testId}`
      });

      if (createError) {
        throw new Error(`Falha ao criar convite: ${createError.message}`);
      }

      if (!createResult || createResult.status !== 'success') {
        throw new Error(`Função create_invite falhou: ${createResult?.message || 'Erro desconhecido'}`);
      }

      console.log(`✅ [TEST-${testId}] Convite criado:`, createResult);

      // ETAPA 2: Buscar dados do convite
      console.log(`🔍 [TEST-${testId}] Verificando dados do convite...`);
      const { data: inviteData, error: fetchError } = await supabase
        .from('invites')
        .select('id, email, token, role_id, expires_at')
        .eq('id', createResult.invite_id)
        .single();

      if (fetchError || !inviteData) {
        throw new Error(`Falha ao buscar convite: ${fetchError?.message || 'Convite não encontrado'}`);
      }

      console.log(`✅ [TEST-${testId}] Dados do convite verificados`);

      // ETAPA 3: Testar envio de email
      console.log(`📧 [TEST-${testId}] Testando envio de email...`);
      const inviteUrl = `${window.location.origin}/accept-invite/${inviteData.token}`;
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: testEmail,
          inviteUrl,
          roleName: roles.find(r => r.id === selectedRoleId)?.name || 'Usuário',
          expiresAt: inviteData.expires_at,
          senderName: 'Sistema de Teste',
          notes: `Teste automático - ${testId}`,
          inviteId: inviteData.id,
          token: inviteData.token,
          requestId: testId
        }
      });

      if (emailError) {
        throw new Error(`Edge Function error: ${emailError.message}`);
      }

      if (!emailResult?.success) {
        throw new Error(`Email falhou: ${emailResult?.message || 'Erro desconhecido'}`);
      }

      console.log(`✅ [TEST-${testId}] Email enviado com sucesso!`);

      // ETAPA 4: Limpar dados de teste
      console.log(`🧹 [TEST-${testId}] Limpando dados de teste...`);
      await supabase
        .from('invites')
        .delete()
        .eq('id', createResult.invite_id);

      console.log(`🎉 [TEST-${testId}] === TESTE CONCLUÍDO COM SUCESSO ===`);

      setTestResult({
        status: 'success',
        message: 'Sistema funcionando perfeitamente!',
        details: {
          inviteId: createResult.invite_id,
          emailId: emailResult.emailId,
          strategy: emailResult.strategy,
          testId
        }
      });

    } catch (error: any) {
      console.error(`💥 [TEST-${testId}] TESTE FALHOU:`, error);
      
      setTestResult({
        status: 'error',
        message: 'Sistema com problemas',
        details: {
          error: error.message,
          testId
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          <CardTitle>Teste do Sistema</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email de Teste</Label>
            <input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="teste@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-select">Papel para Teste</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={rolesLoading}>
              <SelectTrigger>
                <SelectValue placeholder={rolesLoading ? "Carregando..." : "Selecione um papel"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={runSystemTest} 
          disabled={isRunning || !selectedRoleId || !testEmail}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Teste...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Testar Sistema Completo
            </>
          )}
        </Button>

        {testResult && (
          <Alert className={
            testResult.status === 'success' ? 'border-green-200 bg-green-50' :
            testResult.status === 'error' ? 'border-red-200 bg-red-50' :
            'border-yellow-200 bg-yellow-50'
          }>
            {testResult.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={
              testResult.status === 'success' ? 'text-green-700' :
              testResult.status === 'error' ? 'text-red-700' :
              'text-yellow-700'
            }>
              <div className="font-medium">{testResult.message}</div>
              {testResult.details && (
                <div className="text-xs mt-2 opacity-75">
                  {testResult.status === 'success' ? (
                    <div>
                      ✅ Convite: {testResult.details.inviteId?.substring(0, 8)}...<br/>
                      ✅ Email: {testResult.details.emailId}<br/>
                      ✅ Teste: {testResult.details.testId}
                    </div>
                  ) : (
                    <div>
                      ❌ Erro: {testResult.details.error}<br/>
                      🔍 Teste: {testResult.details.testId}
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <Mail className="h-3 w-3 inline mr-1" />
          O teste criará um convite temporário e tentará enviá-lo. Os dados são automaticamente limpos.
        </div>
      </CardContent>
    </Card>
  );
}
