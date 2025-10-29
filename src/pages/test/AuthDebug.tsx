import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthDebug() {
  const { user, session, profile } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Teste 1: getUser()
      const { data: userData, error: userError } = await supabase.auth.getUser();
      results.getUser = {
        success: !userError && !!userData.user,
        data: userData.user ? {
          id: userData.user.id,
          email: userData.user.email,
          created_at: userData.user.created_at
        } : null,
        error: userError?.message
      };

      // Teste 2: getSession()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.getSession = {
        success: !sessionError && !!sessionData.session,
        data: sessionData.session ? {
          user_id: sessionData.session.user.id,
          expires_at: sessionData.session.expires_at,
          access_token: sessionData.session.access_token ? '✓ Presente' : '✗ Ausente',
          refresh_token: sessionData.session.refresh_token ? '✓ Presente' : '✗ Ausente'
        } : null,
        error: sessionError?.message
      };

      // Teste 3: Verificar auth.uid() via função
      try {
        const { data: authUidData, error: authUidError } = await supabase.rpc('get_current_user_id');
        results.authUid = {
          success: !authUidError,
          data: authUidData,
          error: authUidError?.message
        };
      } catch (e: any) {
        results.authUid = {
          success: false,
          error: 'Função get_current_user_id não existe (criar via migration se necessário)'
        };
      }

      // Teste 4: Tentar INSERT em community_posts (simulado)
      if (userData.user) {
        const testTopicId = '00000000-0000-0000-0000-000000000000'; // UUID falso para teste
        const { error: insertError } = await supabase
          .from('community_posts')
          .insert([{
            content: '[TESTE AUTH DEBUG - IGNORAR]',
            topic_id: testTopicId,
            user_id: userData.user.id
          }])
          .select();

        results.insertTest = {
          success: !insertError,
          error: insertError?.message,
          note: 'Teste de INSERT (não deve criar post real se topic_id for inválido)'
        };
      }

    } catch (error: any) {
      console.error('Erro nos testes:', error);
      toast.error('Erro ao executar testes: ' + error.message);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        toast.error('Erro ao renovar sessão: ' + error.message);
      } else {
        toast.success('Sessão renovada com sucesso!');
        runTests();
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug de Autenticação</h1>
        <p className="text-muted-foreground">
          Página para diagnosticar problemas de autenticação e RLS
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Contexto de Auth</CardTitle>
            <CardDescription>Informações do useAuth()</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Usuário Logado:</span>
              {user ? (
                <Badge variant="default">✓ Sim</Badge>
              ) : (
                <Badge variant="destructive">✗ Não</Badge>
              )}
            </div>
            
            {user && (
              <>
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-sm text-muted-foreground break-all">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Sessão Ativa:</span>
              {session ? (
                <Badge variant="default">✓ Sim</Badge>
              ) : (
                <Badge variant="destructive">✗ Não</Badge>
              )}
            </div>

            {session && (
              <div>
                <span className="font-medium">Expira em:</span>
                <p className="text-sm text-muted-foreground">
                  {session.expires_at 
                    ? new Date(session.expires_at * 1000).toLocaleString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Profile Carregado:</span>
              {profile ? (
                <Badge variant="default">✓ Sim</Badge>
              ) : (
                <Badge variant="destructive">✗ Não</Badge>
              )}
            </div>

            {profile && (
              <div>
                <span className="font-medium">Nome:</span>
                <p className="text-sm text-muted-foreground">{profile.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações de Teste</CardTitle>
            <CardDescription>Execute testes e operações de debug</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Executar Testes
            </Button>
            
            <Button 
              onClick={refreshSession}
              variant="secondary"
              className="w-full"
            >
              Renovar Sessão
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Informações
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>auth.uid() deve retornar seu User ID</li>
                <li>Access token deve estar presente</li>
                <li>Session deve estar válida</li>
                <li>INSERT deve funcionar se tudo estiver OK</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        {Object.keys(testResults).length > 0 && (
          <>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Teste getUser() */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon success={testResults.getUser?.success} />
                      <h4 className="font-semibold">supabase.auth.getUser()</h4>
                    </div>
                    {testResults.getUser?.success ? (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.getUser.data, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-destructive">
                        Erro: {testResults.getUser?.error || 'Desconhecido'}
                      </p>
                    )}
                  </div>

                  {/* Teste getSession() */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon success={testResults.getSession?.success} />
                      <h4 className="font-semibold">supabase.auth.getSession()</h4>
                    </div>
                    {testResults.getSession?.success ? (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.getSession.data, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-destructive">
                        Erro: {testResults.getSession?.error || 'Desconhecido'}
                      </p>
                    )}
                  </div>

                  {/* Teste auth.uid() */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon success={testResults.authUid?.success} />
                      <h4 className="font-semibold">auth.uid() via RPC</h4>
                    </div>
                    {testResults.authUid?.success ? (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.authUid.data, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-destructive">
                        Erro: {testResults.authUid?.error || 'Desconhecido'}
                      </p>
                    )}
                  </div>

                  {/* Teste INSERT */}
                  {testResults.insertTest && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon success={testResults.insertTest?.success} />
                        <h4 className="font-semibold">Teste de INSERT em community_posts</h4>
                      </div>
                      {testResults.insertTest?.success ? (
                        <p className="text-sm text-green-600">
                          ✓ INSERT funcionaria (teste não criou post real)
                        </p>
                      ) : (
                        <div>
                          <p className="text-sm text-destructive mb-2">
                            ✗ INSERT falharia:
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {testResults.insertTest.error}
                          </pre>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {testResults.insertTest.note}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
