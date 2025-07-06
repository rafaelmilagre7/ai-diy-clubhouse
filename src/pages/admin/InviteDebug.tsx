import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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