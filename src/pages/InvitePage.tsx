
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, LogOut, UserCheck, Mail, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';
import { validateInviteToken } from '@/utils/inviteValidationUtils';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';

interface InviteData {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  role: {
    name: string;
  };
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, signUp, signIn, signOut } = useAuth();
  const { validateInviteTokenAsync } = useInviteValidation();

  const [isLoading, setIsLoading] = useState(true);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateInvite();
    }
  }, [token]);

  const validateInvite = async () => {
    if (!token) {
      toast.error('Token de convite não fornecido');
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔍 Validando convite para token:", token.substring(0, 8) + "***");

      // Usar nosso utilitário de validação
      const result = await validateInviteTokenAsync(token, user?.email);
      setValidationResult(result);

      if (!result.isValid) {
        console.log("❌ Convite inválido:", result);
        toast.error(result.error || 'Convite inválido');
        return;
      }

      // Se chegou aqui, o convite é válido
      if (result.invite) {
        // Corrigir o acesso à propriedade role
        const inviteData: InviteData = {
          id: result.invite.id,
          email: result.invite.email,
          expires_at: result.invite.expires_at,
          used_at: result.invite.used_at,
          role: {
            name: result.invite.role?.name || 'membro'
          }
        };
        setInvite(inviteData);
        console.log("✅ Convite válido para:", inviteData.email);
      }

    } catch (error: any) {
      console.error('❌ Erro ao validar convite:', error);
      toast.error('Erro ao validar convite: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      // Revalidar após logout
      setTimeout(() => {
        validateInvite();
      }, 1000);
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invite || !token) {
      toast.error('Dados do convite não encontrados');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsRegistering(true);
      console.log('🚀 Iniciando registro para:', invite.email);

      // Tentar registrar
      const { user: newUser, error: signUpError } = await signUp(invite.email, password);
      
      if (signUpError) {
        console.error('❌ Erro no signUp:', signUpError);
        
        // Se o erro indica que o usuário já existe, sugerir login
        if (signUpError.message?.includes('already registered') || 
            signUpError.message?.includes('já está cadastrado') ||
            signUpError.message?.includes('User already registered')) {
          
          toast.error('Este email já possui uma conta', {
            description: 'Tente fazer login em vez de criar uma nova conta.',
            duration: 8000,
            action: {
              label: 'Ir para Login',
              onClick: () => navigate('/login')
            }
          });
          return;
        }

        // Para outros erros, mostrar mensagem específica
        throw new Error(signUpError.message);
      }

      if (newUser) {
        console.log('✅ Usuário criado:', newUser.id);
        
        // Usar o convite
        const { data: useResult, error: useError } = await supabase.rpc('use_invite', {
          invite_token: token,
          user_id: newUser.id
        });

        if (useError) {
          console.error('❌ Erro ao usar convite:', useError);
          throw new Error('Erro ao processar convite: ' + useError.message);
        }

        if (useResult?.status === 'success') {
          console.log('✅ Convite usado com sucesso');
          toast.success('Conta criada com sucesso!', {
            description: 'Bem-vindo(a) à plataforma!',
            duration: 5000
          });
          navigate('/onboarding');
        } else {
          console.error('❌ Falha ao usar convite:', useResult);
          throw new Error(useResult?.message || 'Falha ao processar convite');
        }
      }

    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      toast.error('Erro ao criar conta', {
        description: error.message,
        duration: 8000
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Validando convite..." />;
  }

  // Mostrar erro de validação se necessário
  if (validationResult && !validationResult.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationResult.error}
              </AlertDescription>
            </Alert>

            {validationResult.needsLogout && (
              <div className="space-y-3">
                <Alert className="border-amber-200 bg-amber-50">
                  <LogOut className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Você precisa fazer logout antes de usar este convite.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleLogout} className="w-full" variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Fazer Logout
                </Button>
              </div>
            )}

            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Sugestões:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {validationResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="default"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar formulário de registro se convite é válido
  if (invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Convite Válido!</CardTitle>
            <CardDescription>
              Complete seu cadastro para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Email: {invite.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Papel: {invite.role.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Expira em: {new Date(invite.expires_at).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  minLength={6}
                  disabled={isRegistering}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                  minLength={6}
                  disabled={isRegistering}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isRegistering || !password || password !== confirmPassword}
              >
                {isRegistering ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Processando Convite</CardTitle>
          <CardDescription>Aguarde enquanto validamos seu convite...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
