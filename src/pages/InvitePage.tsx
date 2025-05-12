
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
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Se tiver um token na URL e o usuário estiver autenticado, processar automaticamente
    if (tokenFromUrl && user) {
      processInvite(tokenFromUrl);
    }
  }, [tokenFromUrl, user]);

  const normalizeToken = (inputToken: string): string => {
    // Remover espaços, converter para maiúsculas e limpar caracteres especiais
    return inputToken.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
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
      setTimeout(() => navigate('/'), 2000);

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
    processInvite(token);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Aceitar Convite</CardTitle>
          <CardDescription>
            {tokenFromUrl 
              ? 'Processando seu convite...' 
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
                      Processando...
                    </>
                  ) : (
                    'Aceitar Convite'
                  )}
                </Button>
              </div>
            </form>
          )}

          {tokenFromUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                ) : (
                  <p className="text-green-600">
                    Convite processado com sucesso!
                  </p>
                )}
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">
                Você precisa estar logado para aceitar um convite.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
              >
                Fazer Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
