
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import LoadingScreen from '@/components/common/LoadingScreen';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn } = useAuth();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  const { processInviteRegistration, processInviteForExistingUser, isProcessing } = useInviteFlow();

  const [mode, setMode] = useState<'loading' | 'register' | 'login' | 'success' | 'error'>('loading');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    loginPassword: ''
  });

  // URLs de parâmetros
  const tokenFromParams = token || searchParams.get('token') || undefined;
  const emailFromParams = searchParams.get('email') || '';

  console.log('[ENHANCED-INVITE] Inicializando com:', {
    token: tokenFromParams,
    email: emailFromParams,
    hasUser: !!user
  });

  // Efeito para determinar o modo baseado no estado
  useEffect(() => {
    if (inviteLoading) {
      setMode('loading');
      return;
    }

    if (inviteError) {
      setMode('error');
      setMessage(inviteError);
      return;
    }

    if (!inviteDetails) {
      setMode('error');
      setMessage('Convite não encontrado');
      return;
    }

    // Se usuário já está logado, processar convite automaticamente
    if (user) {
      handleExistingUserInvite();
      return;
    }

    // Se não há usuário, mostrar opções de registro/login
    setMode('register');
  }, [inviteLoading, inviteError, inviteDetails, user]);

  const handleExistingUserInvite = async () => {
    if (!tokenFromParams || !user) return;

    try {
      setMode('loading');
      setMessage('Aplicando convite à sua conta...');

      const result = await processInviteForExistingUser(tokenFromParams);

      if (result.success) {
        setMode('success');
        setMessage(result.message || 'Convite aplicado com sucesso!');
        
        setTimeout(() => {
          if (result.redirectPath) {
            navigate(result.redirectPath);
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setMode('error');
        setMessage(result.message || 'Erro ao aplicar convite');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro ao processar convite:', error);
      setMode('error');
      setMessage('Erro inesperado ao processar convite');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenFromParams || !inviteDetails) {
      setMessage('Dados do convite inválidos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setMessage('Criando sua conta...');

      const result = await processInviteRegistration(
        tokenFromParams,
        inviteDetails.email,
        formData.password,
        formData.name
      );

      if (result.success) {
        setMode('success');
        setMessage(result.message || 'Conta criada com sucesso!');
        
        setTimeout(() => {
          if (result.shouldRedirectToOnboarding) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setMessage(result.message || 'Erro ao criar conta');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no registro:', error);
      setMessage('Erro inesperado durante o registro');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteDetails) {
      setMessage('Dados do convite inválidos');
      return;
    }

    try {
      setMessage('Fazendo login...');

      const { error: loginError } = await signIn(inviteDetails.email, formData.loginPassword);

      if (loginError) {
        setMessage('Email ou senha incorretos');
        return;
      }

      // Após login bem-sucedido, o useEffect irá processar o convite automaticamente
      setMessage('Login realizado! Aplicando convite...');

    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no login:', error);
      setMessage('Erro inesperado durante o login');
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (message) {
      setMessage('');
    }
  };

  if (mode === 'loading') {
    return <LoadingScreen message="Verificando convite..." />;
  }

  if (mode === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erro no Convite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full mt-4"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Convite Aceito!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Redirecionando automaticamente...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Convite para Viver de IA
          </CardTitle>
          {inviteDetails && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Você foi convidado para: <strong>{inviteDetails.role.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Email: <strong>{inviteDetails.email}</strong>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Formulário de Registro */}
          <form onSubmit={handleRegister} className="space-y-4">
            <h3 className="font-semibold">Criar Nova Conta</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta e Aceitar Convite'
              )}
            </Button>
          </form>

          <Separator />

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="font-semibold">Já tem uma conta?</h3>
            
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Senha</Label>
              <Input
                id="loginPassword"
                type="password"
                value={formData.loginPassword}
                onChange={handleInputChange('loginPassword')}
                placeholder="Sua senha"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="outline" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fazendo login...
                </>
              ) : (
                'Fazer Login e Aceitar Convite'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
