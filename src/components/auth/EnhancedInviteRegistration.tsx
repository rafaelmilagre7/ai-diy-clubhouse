
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useAuth } from '@/contexts/auth';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { toast } from 'sonner';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ 
  token 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  const { isProcessing, registerWithInvite, applyInviteToExistingUser } = useInviteFlow();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginOption, setShowLoginOption] = useState(false);

  // Detectar tipo de usuário baseado no role do convite
  const userType = inviteDetails?.role?.name === 'formacao' ? 'formacao' : 'club';

  // URL params para detecção de tipo
  const urlParams = new URLSearchParams(location.search);

  console.log('[ENHANCED-INVITE] Estado atual:', {
    token,
    inviteDetails,
    inviteLoading,
    inviteError,
    userType,
    user: !!user
  });

  // Se usuário já está logado, aplicar convite
  useEffect(() => {
    if (user && inviteDetails && token) {
      console.log('[ENHANCED-INVITE] Usuário logado detectado, aplicando convite');
      handleApplyInviteToLoggedUser();
    }
  }, [user, inviteDetails, token]);

  const handleApplyInviteToLoggedUser = async () => {
    if (!user || !token) return;

    try {
      const result = await applyInviteToExistingUser(token, user.id);
      
      if (result.success) {
        toast.success(result.message);
        if (result.shouldRedirectToOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('[ENHANCED-INVITE] Erro ao aplicar convite:', error);
      toast.error('Erro ao aplicar convite');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !inviteDetails) {
      toast.error('Convite inválido');
      return;
    }

    // Validações básicas
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    try {
      const result = await registerWithInvite(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        token
      );

      if (result.success) {
        toast.success(result.message);
        if (result.shouldRedirectToOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (result.shouldRedirectToLogin) {
          setShowLoginOption(true);
          toast.error(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error('[ENHANCED-INVITE] Erro no submit:', error);
      toast.error('Erro inesperado');
    }
  };

  const handleGoToLogin = () => {
    // Salvar token na URL para que possa ser usado após login
    navigate(`/login?invite_token=${token}`);
  };

  // Estados de loading
  if (inviteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
              <p className="text-slate-300 text-center">Verificando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de erro do convite
  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-xl font-semibold text-white">Convite Inválido</h3>
              <p className="text-slate-300">{inviteError || 'Convite não encontrado ou expirado'}</p>
              <Button onClick={() => navigate('/login')} variant="outline">
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center space-y-4">
          <DynamicBrandLogo 
            userType={userType}
            inviteRole={inviteDetails.role.name}
            urlParams={urlParams}
            className="mx-auto h-16 w-auto"
          />
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-slate-300 mt-2">
              Você foi convidado para se juntar como <strong>{inviteDetails.role.name}</strong>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showLoginOption && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta conta já existe. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-viverblue"
                  onClick={handleGoToLogin}
                >
                  Clique aqui para fazer login
                </Button> e aplicar o convite.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Seu nome completo"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder={inviteDetails.email}
                  required
                  disabled={isProcessing}
                />
              </div>
              {inviteDetails.email && (
                <p className="text-xs text-slate-400">
                  Sugerido: {inviteDetails.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isProcessing}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isProcessing}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Repita sua senha"
                  required
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isProcessing}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-viverblue hover:bg-viverblue/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white"
              disabled={isProcessing}
            >
              Já tem uma conta? Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
