
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useIntelligentRedirect } from '@/hooks/useIntelligentRedirect';
import { InviteSecurityUtils } from '@/utils/inviteSecurityUtils';
import { OnboardingLoadingState } from '@/components/onboarding/components/OnboardingLoadingStates';
import { OnboardingErrorHandler } from '@/components/onboarding/components/OnboardingErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const InviteRegisterForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { redirect } = useIntelligentRedirect();
  
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string>('');
  
  const { 
    inviteDetails, 
    isLoading: inviteLoading, 
    error: inviteError, 
    registerWithInvite,
    isProcessing 
  } = useInviteFlow(token || undefined);

  // Validação inicial do token
  useEffect(() => {
    if (!token) {
      console.log('[INVITE-REGISTER] Token não fornecido');
      navigate('/register');
      return;
    }

    if (!InviteSecurityUtils.validateTokenFormat(token)) {
      console.log('[INVITE-REGISTER] Formato de token inválido');
      toast.error('Formato de convite inválido');
      navigate('/register');
      return;
    }
  }, [token, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando usuário começar a digitar
    if (registrationError) {
      setRegistrationError('');
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Nome é obrigatório';
    }

    if (formData.name.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.password) {
      return 'Senha é obrigatória';
    }

    if (formData.password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Senhas não coincidem';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteDetails || !token) {
      toast.error('Dados do convite não encontrados');
      return;
    }

    // Validação do formulário
    const validationError = validateForm();
    if (validationError) {
      setRegistrationError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setRegistrationError('');
      console.log('[INVITE-REGISTER] Iniciando registro com convite');

      // Registrar usuário
      const result = await registerWithInvite(formData.name.trim(), formData.password);
      
      if (result.success) {
        toast.success(result.message);
        
        // Log de sucesso
        await InviteSecurityUtils.logInviteUsageAttempt(
          token,
          true,
          'Registro com convite realizado com sucesso'
        );

        // Redirecionamento inteligente
        redirect({
          requiresOnboarding: result.requiresOnboarding,
          fromInvite: true,
          preserveToken: true
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('[INVITE-REGISTER] Erro no registro:', error);
      setRegistrationError(error.message);
      toast.error(error.message);
      
      // Log de erro
      await InviteSecurityUtils.logInviteUsageAttempt(
        token!,
        false,
        error.message
      );
    }
  };

  // Loading state
  if (inviteLoading) {
    return <OnboardingLoadingState type="verification" message="Validando convite..." />;
  }

  // Error state
  if (inviteError) {
    return (
      <OnboardingErrorHandler
        error={inviteError}
        type="validation"
        onRetry={() => window.location.reload()}
        onCancel={() => navigate('/register')}
        showContactSupport={true}
      />
    );
  }

  if (registrationError && registrationError.includes('sistema')) {
    return (
      <OnboardingErrorHandler
        error={registrationError}
        type="system"
        onRetry={() => setRegistrationError('')}
        onCancel={() => navigate('/register')}
        showContactSupport={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-viverblue" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Criar Conta via Convite
          </CardTitle>
          {inviteDetails && (
            <div className="text-sm text-neutral-300 space-y-1">
              <p>Você foi convidado para:</p>
              <p className="text-viverblue font-medium">{inviteDetails.role.description}</p>
              <p className="text-neutral-400">Email: {inviteDetails.email}</p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                className="bg-[#252842] border-white/20 text-white placeholder:text-neutral-400"
                disabled={isProcessing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  className="bg-[#252842] border-white/20 text-white placeholder:text-neutral-400 pr-10"
                  disabled={isProcessing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme sua senha"
                  className="bg-[#252842] border-white/20 text-white placeholder:text-neutral-400 pr-10"
                  disabled={isProcessing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {registrationError && !registrationError.includes('sistema') && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{registrationError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? 'Criando conta...' : 'Criar Conta e Aceitar Convite'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-neutral-400 hover:text-white"
                disabled={isProcessing}
              >
                Já tenho conta - Fazer Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegisterForm;
