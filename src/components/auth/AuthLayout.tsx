
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { toast } from 'sonner';

const AuthLayout = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInviteToken, setHasInviteToken] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const { applyInviteToExistingUser } = useInviteFlow();

  // Verificar se há token de convite na URL
  const urlParams = new URLSearchParams(location.search);
  const inviteToken = urlParams.get('invite_token');

  useEffect(() => {
    setHasInviteToken(!!inviteToken);
  }, [inviteToken]);

  // Se usuário já está logado, redirecionar
  useEffect(() => {
    if (user) {
      if (inviteToken) {
        // Aplicar convite e redirecionar
        handleApplyInviteAfterLogin();
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, inviteToken, navigate]);

  const handleApplyInviteAfterLogin = async () => {
    if (!user || !inviteToken) return;

    try {
      const result = await applyInviteToExistingUser(inviteToken, user.id);
      
      if (result.success) {
        toast.success(result.message);
        if (result.shouldRedirectToOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('[AUTH-LAYOUT] Erro ao aplicar convite:', error);
      toast.error('Erro ao aplicar convite');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Erro no login: ' + error.message);
      } else {
        // O useEffect acima vai tratar o redirecionamento
        if (!inviteToken) {
          navigate('/dashboard');
        }
        // Se tem invite token, o useEffect vai aplicar o convite
      }
    } catch (error: any) {
      toast.error('Erro inesperado: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    if (inviteToken) {
      navigate(`/invite/${inviteToken}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center space-y-4">
          <DynamicBrandLogo 
            defaultType="club"
            className="mx-auto h-20 w-auto"
          />
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              {hasInviteToken ? 'Login para Aceitar Convite' : 'Entrar'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {hasInviteToken 
                ? 'Faça login para aplicar seu convite'
                : 'Acesse sua conta'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {hasInviteToken && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você tem um convite pendente. Faça login ou{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-viverblue"
                  onClick={handleGoToRegister}
                >
                  crie uma nova conta
                </Button>
                .
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Sua senha"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-viverblue hover:bg-viverblue/90"
              disabled={isLoading}
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

          <Separator className="bg-gray-600" />

          <div className="text-center space-y-2">
            <Button 
              variant="link" 
              onClick={handleGoToRegister}
              className="text-slate-400 hover:text-white w-full"
              disabled={isLoading}
            >
              {hasInviteToken 
                ? 'Criar nova conta com convite'
                : 'Não tem conta? Criar conta'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
