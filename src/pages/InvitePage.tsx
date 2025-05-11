
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const InvitePage = () => {
  const { token: tokenFromUrl } = useParams<{ token: string }>();
  const [token, setToken] = useState<string>(tokenFromUrl || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<{ email?: string; role_id?: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (tokenFromUrl) {
      // Se tiver um token na URL, vamos verificar o convite
      verifyInvite(tokenFromUrl);
    }
  }, [tokenFromUrl]);
  
  // Função para normalizar o token (remover espaços, etc.)
  const normalizeToken = (inputToken: string): string => {
    return inputToken.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };
  
  // Função para verificar o convite antes de processá-lo
  const verifyInvite = async (inviteToken: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedToken = normalizeToken(inviteToken);
      if (!normalizedToken) {
        throw new Error('Token de convite inválido');
      }
      
      // Verificar se o convite existe e está válido
      const { data, error } = await supabase
        .from('invites')
        .select('email, role_id, used_at, expires_at')
        .eq('token', normalizedToken)
        .single();
        
      if (error) {
        console.error("Erro ao verificar convite:", error);
        throw new Error('Token não encontrado ou inválido');
      }
      
      if (data.used_at) {
        throw new Error('Este convite já foi utilizado');
      }
      
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('Este convite expirou');
      }
      
      // Armazenar os dados do convite
      setInviteInfo({
        email: data.email,
        role_id: data.role_id
      });
      
      // Verificar se o usuário já está logado
      if (user) {
        // Se estiver logado, processar o convite
        await processInvite(normalizedToken);
      } else {
        // Se não estiver logado, verificar se o usuário já existe
        const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(data.email);
        
        if (userError) {
          console.log("Erro ou usuário não encontrado:", userError);
          // Redirecionar para página de registro com os dados do convite
          navigate(`/register?token=${normalizedToken}&email=${encodeURIComponent(data.email)}`);
        } else {
          // Usuário existe, mostrar mensagem para fazer login
          toast.info("Você já possui uma conta", {
            description: "Por favor, faça login para aceitar o convite"
          });
          navigate(`/login?token=${normalizedToken}&email=${encodeURIComponent(data.email)}`);
        }
      }
    } catch (err: any) {
      console.error("Erro ao verificar convite:", err);
      setError(err.message || 'Erro ao verificar convite');
    } finally {
      setLoading(false);
    }
  };

  const processInvite = async (inviteToken: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para aceitar um convite');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const normalizedToken = normalizeToken(inviteToken);
      console.log("Processando convite com token normalizado:", normalizedToken);
      
      if (!normalizedToken) {
        throw new Error('Token de convite inválido');
      }

      // Chama a função RPC use_invite para processar o convite
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: normalizedToken,
        user_id: user.id
      });

      console.log("Resposta da função use_invite:", data);

      if (error) {
        console.error("Erro ao processar convite:", error);
        throw new Error(error.message || 'Erro ao processar convite');
      }

      if (data.status === 'error') {
        console.error("Erro retornado pela função:", data);
        throw new Error(data.message || 'Token inválido ou expirado');
      }

      toast.success('Convite aceito com sucesso!', {
        description: 'Seu acesso foi atualizado.'
      });

      // Redirecionar para a página principal após sucesso
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err: any) {
      console.error('Erro ao processar convite:', err);
      setError(err.message || 'Ocorreu um erro ao processar o convite');
      toast.error('Erro ao processar convite', {
        description: err.message || 'Por favor, verifique o token e tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyInvite(token);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Aceitar Convite</CardTitle>
          <CardDescription>
            {tokenFromUrl 
              ? 'Verificando seu convite...' 
              : 'Insira o código do convite que você recebeu por e-mail'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!tokenFromUrl && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Código do convite (ex: ABCDEF123456)"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="text-center tracking-wide text-lg font-mono"
                    autoFocus
                  />
                  {error && (
                    <p className="text-destructive text-sm text-center">{error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !token.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Convite'
                  )}
                </Button>
              </div>
            </form>
          )}

          {tokenFromUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center">
                {loading ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Verificando convite...</p>
                  </div>
                ) : error ? (
                  <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tente inserir o código manualmente:
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <Input
                          placeholder="Código do convite"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="text-center tracking-wide text-lg font-mono"
                        />
                        <Button type="submit" className="w-full">
                          Tentar Novamente
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {!user && !loading && !error && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">
                Você precisa estar logado para aceitar um convite.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Fazer Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                  className="w-full"
                >
                  Criar Conta
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
