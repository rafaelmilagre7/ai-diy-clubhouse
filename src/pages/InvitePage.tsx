
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface InviteData {
  id: string;
  email: string;
  role_id: string;
  token: string;
  expires_at: string;
}

const InvitePage = () => {
  const { token: tokenFromUrl } = useParams<{ token: string }>();
  const [token, setToken] = useState<string>(tokenFromUrl || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(!!tokenFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados para cadastro/login de usuário
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  
  // Verificar token na URL e buscar dados do convite
  useEffect(() => {
    if (tokenFromUrl) {
      checkInviteToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);
  
  // Se o usuário já está autenticado e temos dados do convite, processar automaticamente
  useEffect(() => {
    if (tokenFromUrl && user && inviteData) {
      processInvite(tokenFromUrl);
    }
  }, [tokenFromUrl, user, inviteData]);

  const normalizeToken = (inputToken: string): string => {
    return inputToken.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };
  
  // Função para verificar se um email já existe no sistema
  const checkEmailExists = async (emailToCheck: string) => {
    try {
      setCheckingEmail(true);
      
      // Tentar fazer login com um método que vai falhar, mas nos diz se o email existe
      const { error } = await supabase.auth.signInWithOtp({
        email: emailToCheck,
        options: {
          shouldCreateUser: false // Não criar usuário, apenas verificar
        }
      });
      
      // Se o erro for "User not found", então o email não existe
      const userNotFound = error?.message?.toLowerCase().includes('user not found') ||
                          error?.message?.toLowerCase().includes('usuário não encontrado');
      
      setEmailExists(!userNotFound);
      return !userNotFound;
      
    } catch (err) {
      console.error("Erro ao verificar email:", err);
      // Em caso de erro, assumimos que o email não existe para permitir tentativa de registro
      setEmailExists(false);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };
  
  // Função para verificar o token sem necessidade de autenticação
  const checkInviteToken = async (inviteToken: string) => {
    try {
      setCheckingToken(true);
      setError(null);
      
      const normalizedToken = normalizeToken(inviteToken);
      console.log("Verificando token de convite:", normalizedToken);
      
      // Chamar a função RPC check_invite_token
      const { data, error } = await supabase.rpc('check_invite_token', {
        invite_token: normalizedToken
      });
      
      if (error) {
        console.error("Erro ao verificar token:", error);
        throw new Error(error.message || 'Erro ao verificar convite');
      }
      
      if (data.status === 'error') {
        console.error("Erro retornado pela função:", data);
        throw new Error(data.message || 'Token inválido ou expirado');
      }
      
      console.log("Dados do convite:", data);
      
      // Definir dados do convite e email para registro
      setInviteData({
        id: data.invite_id,
        email: data.email,
        role_id: data.role_id,
        token: data.token,
        expires_at: data.expires_at
      });
      
      setEmail(data.email);
      
      // Verificar se o email já existe
      await checkEmailExists(data.email);
      
    } catch (err: any) {
      console.error('Erro ao verificar token:', err);
      setError(err.message || 'Token de convite inválido');
    } finally {
      setCheckingToken(false);
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

  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    checkInviteToken(token);
  };
  
  // Função unificada para lidar com registro ou login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!emailExists && !name) {
      toast.error('O nome é obrigatório para novos cadastros');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let authResult;
      
      if (emailExists) {
        // Email já existe, tenta login
        authResult = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
      } else {
        // Novo usuário, registrar
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        
        authResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
      }
      
      if (authResult.error) {
        throw authResult.error;
      }
      
      if (authResult.data.user) {
        const actionMsg = emailExists ? 'Login realizado' : 'Conta criada';
        toast.success(`${actionMsg} com sucesso!`);
        
        // O convite será processado automaticamente pelo useEffect
        // quando detectar que o usuário está autenticado
      } else if (!emailExists && authResult.data.session === null) {
        // Caso especial: registro bem sucedido mas precisa confirmar email
        toast.info(
          'Verifique seu email', 
          { description: 'Enviamos um link de confirmação para o seu email.' }
        );
      }
      
    } catch (err: any) {
      console.error("Erro de autenticação:", err);
      
      // Tratar mensagens de erro específicas para torná-las mais amigáveis
      let errorMsg = err.message || 'Erro ao processar a solicitação';
      
      if (errorMsg.includes('User already registered') || 
          errorMsg.includes('already registered')) {
        errorMsg = 'Este email já está cadastrado. Por favor, faça login.';
        // Atualizar o estado para mostrar o formulário de login
        setEmailExists(true);
      } else if (errorMsg.includes('Invalid login')) {
        errorMsg = 'Email ou senha inválidos. Verifique suas credenciais.';
      }
      
      setError(errorMsg);
      toast.error('Erro no processo', { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Função para determinar qual componente exibir com base no estado atual
  const renderContent = () => {
    // Se estiver verificando o token
    if (checkingToken) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-center text-muted-foreground">Verificando seu convite...</p>
        </div>
      );
    }
    
    // Se o usuário já estiver logado e tiver dados do convite
    if (user && inviteData) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          {loading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-center text-muted-foreground">Processando seu convite...</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-center">Bem-vindo!</p>
              <p className="mt-2 text-center text-muted-foreground">
                Você está prestes a aceitar um convite para {inviteData.email}
              </p>
              <Button 
                onClick={() => processInvite(tokenFromUrl || inviteData.token)} 
                className="mt-4 w-full"
                disabled={loading}
              >
                Aceitar Convite
              </Button>
            </>
          )}
        </div>
      );
    }
    
    // Se temos o convite mas o usuário não está logado
    if (inviteData && !user) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-lg font-medium text-center mb-2">Convite para: {inviteData.email}</p>
            {emailExists === null ? (
              <p className="text-sm text-center text-muted-foreground">
                Verificando status do email...
              </p>
            ) : emailExists ? (
              <p className="text-sm text-center text-muted-foreground">
                Este email já está cadastrado. Faça login para aceitar o convite.
              </p>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Crie sua conta para aceitar o convite.
              </p>
            )}
          </div>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!emailExists && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Seu nome completo"
                    required={!emailExists}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  readOnly
                  className="pl-10 bg-muted"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder={emailExists ? "Sua senha" : "Escolha uma senha"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {!emailExists && (
                <p className="text-xs text-muted-foreground">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || (checkingEmail)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {emailExists ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                emailExists ? 'Entrar e aceitar convite' : 'Criar conta e aceitar convite'
              )}
            </Button>
          </form>
          
          {error && (
            <p className="text-sm text-destructive text-center mt-4">{error}</p>
          )}
        </div>
      );
    }
    
    // Se não temos token ou o token é inválido
    return (
      <>
        <form onSubmit={handleSubmitToken}>
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
            className="w-full mt-4" 
            disabled={loading || !token.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Verificar Convite'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Já tem uma conta? <a href="/login" className="text-primary hover:underline">Faça login</a>
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Convite para o VIVER DE IA Club</CardTitle>
          <CardDescription>
            {inviteData 
              ? `Você foi convidado com o email ${inviteData.email}` 
              : 'Insira ou confirme seu código de convite'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
