import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config/app';

const InviteDebug = () => {
  const [token, setToken] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testValidation = async () => {
    if (!token) {
      toast.error('Digite um token para testar');
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      // Teste 1: Função SQL direta
      console.log('🔍 Testando função SQL...');
      const { data: sqlResult, error: sqlError } = await supabase
        .rpc('validate_invite_token_enhanced', { p_token: token });

      // Teste 2: Busca direta na tabela
      console.log('🔍 Testando busca direta...');
      const { data: directResult, error: directError } = await supabase
        .from('invites')
        .select('*')
        .ilike('token', `%${token}%`)
        .limit(5);

      // Teste 3: Busca exata
      console.log('🔍 Testando busca exata...');
      const { data: exactResult, error: exactError } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .limit(1);

      const info = {
        inputToken: token,
        cleanToken: token.trim().replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, ''),
        sqlFunction: {
          result: sqlResult,
          error: sqlError,
          count: sqlResult?.length || 0
        },
        directSearch: {
          result: directResult,
          error: directError,
          count: directResult?.length || 0
        },
        exactSearch: {
          result: exactResult,
          error: exactError,
          count: exactResult?.length || 0
        },
        timestamp: new Date().toISOString()
      };

      setDebugInfo(info);
      console.log('🔍 Debug completo:', info);

      if (sqlResult?.length > 0) {
        toast.success('Token encontrado via função SQL!');
      } else if (directResult?.length > 0) {
        toast.warning('Token encontrado apenas via busca direta');
      } else if (exactResult?.length > 0) {
        toast.warning('Token encontrado apenas via busca exata');
      } else {
        toast.error('Token não encontrado em nenhuma busca');
      }

    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('Erro ao testar validação');
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Estados para teste de template de convite
  const [inviteEmail, setInviteEmail] = useState('teste@exemplo.com');
  const [invitePhone, setInvitePhone] = useState('5511999999999');
  const [templateTestResult, setTemplateTestResult] = useState<any>(null);
  const [templateTesting, setTemplateTesting] = useState(false);

  const testWhatsApp = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone: '5511999999999', // Número de teste
          inviteUrl: 'https://test.com/convite/TEST123',
          roleName: 'Teste',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Teste de integração WhatsApp'
        }
      });

      if (error) {
        toast.error(`Erro WhatsApp: ${error.message}`);
        console.error('Erro WhatsApp:', error);
      } else {
        toast.success('Teste WhatsApp enviado!');
        console.log('Resultado WhatsApp:', data);
      }
    } catch (error) {
      toast.error('Erro ao testar WhatsApp');
      console.error('Erro WhatsApp:', error);
    }
  };

  const testInviteTemplate = async () => {
    if (!inviteEmail || !invitePhone) {
      toast.error('Digite email e telefone para testar');
      return;
    }

    setTemplateTesting(true);
    setTemplateTestResult(null);

    try {
      console.log('🎯 [TESTE TEMPLATE] Iniciando teste completo de convite...');
      
      // Passo 1: Buscar role_id de 'membro_club' (ou usar um padrão)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, name')
        .in('name', ['membro_club', 'formacao', 'member'])
        .limit(1);

      if (rolesError || !roles?.length) {
        // Listar roles disponíveis para debug
        const { data: allRoles } = await supabase
          .from('user_roles')
          .select('id, name')
          .limit(10);
        
        const availableRoles = allRoles?.map(r => r.name).join(', ') || 'nenhum';
        throw new Error(`Role padrão não encontrado. Roles disponíveis: ${availableRoles}`);
      }

      const roleId = roles[0].id;
      console.log('🎯 [TESTE TEMPLATE] Role ID:', roleId);

      // Passo 2: Criar convite híbrido usando a função SQL
      const { data: inviteResult, error: inviteError } = await supabase
        .rpc('create_invite_hybrid', {
          p_email: inviteEmail,
          p_role_id: roleId,
          p_phone: invitePhone,
          p_expires_in: '7 days',
          p_notes: 'Teste de template de convite via debug',
          p_channel_preference: 'whatsapp'
        });

      console.log('🎯 [TESTE TEMPLATE] Resultado do convite:', inviteResult);

      if (inviteError || inviteResult?.status !== 'success') {
        throw new Error(inviteResult?.message || inviteError?.message || 'Erro ao criar convite');
      }

      const inviteToken = inviteResult.token;
      const inviteId = inviteResult.invite_id;
      const inviteUrl = APP_CONFIG.getAppUrl(`/convite/${inviteToken}`);

      console.log('🎯 [TESTE TEMPLATE] Convite criado:', {
        id: inviteId,
        token: inviteToken,
        url: inviteUrl
      });

      // Passo 3: Enviar via WhatsApp usando o template "convitevia"
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone: invitePhone,
          inviteUrl: inviteUrl,
          roleName: 'Member',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Teste de template via debug',
          inviteId: inviteId
        }
      });

      console.log('🎯 [TESTE TEMPLATE] Resultado WhatsApp:', whatsappResult);

      const result = {
        success: !whatsappError && whatsappResult?.success,
        invite: {
          id: inviteId,
          token: inviteToken,
          url: inviteUrl,
          email: inviteEmail,
          phone: invitePhone
        },
        whatsapp: whatsappResult,
        error: whatsappError?.message,
        timestamp: new Date().toISOString()
      };

      setTemplateTestResult(result);

      if (result.success) {
        toast.success('Template de convite enviado com sucesso!');
      } else {
        toast.error(`Erro no template: ${result.error || 'Erro desconhecido'}`);
      }

    } catch (error) {
      console.error('🎯 [TESTE TEMPLATE] Erro:', error);
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      setTemplateTestResult(errorResult);
      toast.error('Erro ao testar template de convite');
    } finally {
      setTemplateTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Convites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o token do convite para testar..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={testValidation} disabled={loading}>
              {loading ? 'Testando...' : 'Testar Token'}
            </Button>
          </div>

          <Button onClick={testWhatsApp} variant="outline">
            Testar WhatsApp
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Template de Convite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email do Convite:</label>
              <Input
                placeholder="teste@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone (WhatsApp):</label>
              <Input
                placeholder="5511999999999"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={testInviteTemplate} 
            disabled={templateTesting}
            className="w-full"
          >
            {templateTesting ? 'Enviando Template...' : 'Testar Template de Convite Completo'}
          </Button>

          {templateTestResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resultado do Teste de Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant={templateTestResult.success ? 'default' : 'destructive'}>
                    {templateTestResult.success ? 'SUCESSO' : 'ERRO'}
                  </Badge>
                  
                  {templateTestResult.invite && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>Convite Criado:</strong></p>
                      <p>ID: {templateTestResult.invite.id}</p>
                      <p>Token: {templateTestResult.invite.token}</p>
                      <p>URL: <a href={templateTestResult.invite.url} target="_blank" className="text-blue-600 underline">{templateTestResult.invite.url}</a></p>
                    </div>
                  )}

                  {templateTestResult.whatsapp && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <p><strong>WhatsApp:</strong></p>
                      <p>Status: {templateTestResult.whatsapp.success ? 'Enviado' : 'Falhou'}</p>
                      <p>Método: {templateTestResult.whatsapp.method}</p>
                      <p>Telefone: {templateTestResult.whatsapp.phone}</p>
                      {templateTestResult.whatsapp.whatsappId && (
                        <p>Message ID: {templateTestResult.whatsapp.whatsappId}</p>
                      )}
                    </div>
                  )}

                  {templateTestResult.error && (
                    <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                      <strong>Erro:</strong> {templateTestResult.error}
                    </div>
                  )}

                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(templateTestResult, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {debugInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Função SQL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={debugInfo.sqlFunction.count > 0 ? 'default' : 'destructive'}>
                      {debugInfo.sqlFunction.count} resultado(s)
                    </Badge>
                    {debugInfo.sqlFunction.error && (
                      <p className="text-sm text-red-600 mt-2">
                        {debugInfo.sqlFunction.error.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Busca Direta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={debugInfo.directSearch.count > 0 ? 'default' : 'destructive'}>
                      {debugInfo.directSearch.count} resultado(s)
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Busca Exata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={debugInfo.exactSearch.count > 0 ? 'default' : 'destructive'}>
                      {debugInfo.exactSearch.count} resultado(s)
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detalhes Completos</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteDebug;