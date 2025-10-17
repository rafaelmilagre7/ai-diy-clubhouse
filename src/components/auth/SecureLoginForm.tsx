
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecureInput } from '@/components/security/SecureInput';
import { loginRateLimiter, createSecureIdentifier } from '@/utils/secureRateLimiting';
import { emailSchema } from '@/utils/validation';
import { environmentSecurity, canShowTestFeatures } from '@/utils/environmentSecurity';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/auth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const SecureLoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining?: number;
    waitTime?: number;
  }>({});

  // Validar email
  const validateEmail = useCallback((email: string) => {
    try {
      emailSchema.parse(email);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Email inválido'
      };
    }
  }, []);

  // Validar password
  const validatePassword = useCallback((password: string) => {
    if (password.length < 6) {
      return { 
        isValid: false, 
        error: 'Senha deve ter pelo menos 6 caracteres'
      };
    }
    if (password.length > 128) {
      return { 
        isValid: false, 
        error: 'Senha muito longa'
      };
    }
    return { isValid: true };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setError(null);
    
    // Validações básicas
    if (!email.trim() || !password.trim()) {
      setError('Email e senha são obrigatórios');
      return;
    }

    // Validar formato do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Email inválido');
      return;
    }

    // Validar password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Senha inválida');
      return;
    }

    // Verificar rate limiting
    const identifier = createSecureIdentifier(email, 'login');
    const rateLimitCheck = await loginRateLimiter.canAttempt(identifier, 'login_form');
    
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.reason || 'Muitas tentativas. Tente novamente mais tarde.');
      setRateLimitInfo({ waitTime: rateLimitCheck.waitTime });
      
      await auditLogger.logSecurityEvent('login_rate_limited', 'medium', {
        email: email.substring(0, 3) + '***',
        waitTime: rateLimitCheck.waitTime,
        identifier: identifier.substring(0, 10) + '***'
      });
      
      return;
    }
    
    setRateLimitInfo({ remaining: rateLimitCheck.remaining });
    setIsLoading(true);

    try {
      logger.info("Tentativa de login iniciada", {
        component: 'SECURE_LOGIN_FORM',
        email: email.substring(0, 3) + '***',
        environment: environmentSecurity.isProduction() ? 'production' : 'development'
      });

      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      // Login bem-sucedido
      loginRateLimiter.reportSuccess(identifier);
      
      await auditLogger.logAuthEvent('login_success', {
        email: email.substring(0, 3) + '***',
        method: 'email_password'
      });
      
      toast.success('Login realizado com sucesso!');
      
    } catch (error: any) {
      logger.warn("Falha no login", {
        component: 'SECURE_LOGIN_FORM',
        email: email.substring(0, 3) + '***',
        error: error.message
      });
      
      await auditLogger.logAuthEvent('login_failure', {
        email: email.substring(0, 3) + '***',
        error: error.message,
        method: 'email_password'
      });
      
      // Mensagens de erro seguras (não vazar informações)
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Confirme seu email antes de fazer login');
      } else if (error.message?.includes('Too many requests')) {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-6 w-6 text-operational" />
          <CardTitle className="text-2xl font-bold">Login Seguro</CardTitle>
        </div>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar sua conta
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
              autoComplete="current-password"
              validateInput={validatePassword}
              maxLength={128}
            />
          </div>
          
          {rateLimitInfo.remaining !== undefined && rateLimitInfo.remaining <= 2 && (
            <div className="text-sm text-status-warning">
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
