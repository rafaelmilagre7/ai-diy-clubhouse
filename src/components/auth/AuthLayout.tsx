
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecureInput } from '@/components/security/SecureInput';
import { loginRateLimiter, createSecureIdentifier } from '@/utils/secureRateLimiting';
import { validateSecureInput } from '@/utils/validation';
import { canShowTestFeatures } from '@/utils/securityUtils';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/auth';
import { Loader2, Shield, AlertTriangle, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const AuthLayout: React.FC = () => {
  const { signIn, signInAsMember } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining?: number;
    waitTime?: number;
  }>({});

  // Validar email
  const validateEmail = (email: string) => {
    return validateSecureInput(email, 'email');
  };

  // Validar senha
  const validatePassword = (password: string) => {
    return validateSecureInput(password, 'password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setError(null);
    
    // Validações básicas
    if (!email.trim() || !password.trim()) {
      setError('Email e senha são obrigatórios');
      return;
    }

    // Validar se as senhas coincidem no cadastro
    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Validar formato do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Email inválido');
      return;
    }

    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Senha inválida');
      return;
    }

    // Verificar rate limiting
    const identifier = createSecureIdentifier(email, isLogin ? 'login' : 'signup');
    const rateLimitCheck = await loginRateLimiter.canAttempt(identifier, isLogin ? 'login' : 'signup');
    
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.reason || 'Muitas tentativas. Tente novamente mais tarde.');
      setRateLimitInfo({ waitTime: rateLimitCheck.waitTime });
      
      await auditLogger.logSecurityEvent(
        isLogin ? 'login_rate_limited' : 'signup_rate_limited', 
        'medium', 
        {
          email: email.substring(0, 3) + '***',
          waitTime: rateLimitCheck.waitTime,
          identifier: identifier.substring(0, 10) + '***'
        }
      );
      
      return;
    }
    
    setRateLimitInfo({ remaining: rateLimitCheck.remaining });
    setIsLoading(true);

    try {
      logger.info(`Tentativa de ${isLogin ? 'login' : 'cadastro'} iniciada`, {
        component: 'AUTH_LAYOUT',
        email: email.substring(0, 3) + '***',
        action: isLogin ? 'login' : 'signup'
      });

      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signInAsMember(email, password);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Sucesso
      loginRateLimiter.reportSuccess(identifier);
      
      await auditLogger.logAuthEvent(
        isLogin ? 'login_success' : 'signup_success',
        {
          email: email.substring(0, 3) + '***',
          method: 'email_password'
        }
      );
      
      toast.success(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
      
    } catch (error: any) {
      logger.warn(`Falha no ${isLogin ? 'login' : 'cadastro'}`, {
        component: 'AUTH_LAYOUT',
        email: email.substring(0, 3) + '***',
        error: error.message,
        action: isLogin ? 'login' : 'signup'
      });
      
      await auditLogger.logAuthEvent(
        isLogin ? 'login_failure' : 'signup_failure',
        {
          email: email.substring(0, 3) + '***',
          error: error.message,
          method: 'email_password'
        }
      );
      
      // Mensagens de erro seguras
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Confirme seu email antes de fazer login');
      } else if (error.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (error.message?.includes('Too many requests')) {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError(`Erro ao ${isLogin ? 'fazer login' : 'cadastrar'}. Tente novamente.`);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  // Função para login de teste (apenas em desenvolvimento)
  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    if (!canShowTestFeatures()) {
      toast.error('Recursos de teste não disponíveis em produção');
      return;
    }
    
    setEmail(testEmail);
    setPassword(testPassword);
    setIsLogin(true);
    
    // Simular envio do formulário
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Login Seguro' : 'Cadastro Seguro'}
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Entre com suas credenciais para acessar sua conta'
              : 'Crie sua conta para começar a usar a plataforma'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {rateLimitInfo.waitTime && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Aguarde {rateLimitInfo.waitTime} segundos antes de tentar novamente
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <SecureInput
                type="email"
                name="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                validateInput={validateEmail}
                maxLength={255}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <SecureInput
                type="password"
                name="password"
                value={password}
                onChange={setPassword}
                placeholder="Digite sua senha"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                validateInput={validatePassword}
                maxLength={128}
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha
                </label>
                <SecureInput
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirme sua senha"
                  required
                  autoComplete="new-password"
                  validateInput={validatePassword}
                  maxLength={128}
                />
              </div>
            )}
            
            {rateLimitInfo.remaining !== undefined && rateLimitInfo.remaining <= 2 && (
              <div className="text-sm text-amber-600">
                Atenção: {rateLimitInfo.remaining} tentativa(s) restante(s)
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !!rateLimitInfo.waitTime}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              disabled={isLoading}
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Faça login'
              }
            </Button>
          </div>
          
          {/* Botões de teste apenas em desenvolvimento */}
          {canShowTestFeatures() && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                🔧 Recursos de desenvolvimento
              </p>
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestLogin('admin@teste.com', '123456')}
                  disabled={isLoading}
                >
                  Login Admin (Teste)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestLogin('user@teste.com', '123456')}
                  disabled={isLoading}
                >
                  Login Usuário (Teste)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
