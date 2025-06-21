
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { RegisterForm } from './RegisterForm';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { logger } from '@/utils/logger';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  const navigate = useNavigate();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  const { isProcessing, registerWithInvite } = useInviteFlow();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  useEffect(() => {
    console.log('[ENHANCED-INVITE] Componente inicializado:', { 
      token: token?.substring(0, 8) + '...',
      hasInviteDetails: !!inviteDetails,
      inviteLoading,
      inviteError 
    });

    if (!token) {
      console.log('[ENHANCED-INVITE] Nenhum token fornecido, redirecionando...');
      navigate('/login');
      return;
    }

    if (inviteError) {
      console.error('[ENHANCED-INVITE] Erro no convite:', inviteError);
      toast.error(inviteError);
    }
  }, [token, inviteDetails, inviteLoading, inviteError, navigate]);

  const handleRegistration = async (formData: {
    email: string;
    password: string;
    name: string;
  }) => {
    if (!token || !inviteDetails) {
      toast.error('Informações do convite não disponíveis');
      return;
    }

    console.log('[ENHANCED-INVITE] Iniciando registro:', {
      email: formData.email,
      name: formData.name,
      token: token.substring(0, 8) + '...'
    });

    try {
      const result = await registerWithInvite(
        formData.email,
        formData.password,
        formData.name,
        token
      );

      console.log('[ENHANCED-INVITE] Resultado do registro:', result);

      if (result.success) {
        setRegistrationSuccess(true);
        setRegistrationMessage(result.message);
        
        logger.info('Registro com convite concluído com sucesso', {
          component: 'EnhancedInviteRegistration',
          email: formData.email,
          token: token.substring(0, 8) + '...'
        });

        // Aguardar um pouco antes de redirecionar para mostrar sucesso
        setTimeout(() => {
          if (result.shouldRedirectToOnboarding) {
            console.log('[ENHANCED-INVITE] Redirecionando para onboarding...');
            navigate('/onboarding');
          } else {
            console.log('[ENHANCED-INVITE] Redirecionando para dashboard...');
            navigate('/dashboard');
          }
        }, 2000);

      } else if (result.shouldRedirectToLogin) {
        toast.error(result.message);
        setTimeout(() => {
          console.log('[ENHANCED-INVITE] Redirecionando para login...');
          navigate(`/login?invite=${token}`);
        }, 1500);
      } else {
        toast.error(result.message);
        setRegistrationMessage(result.message);
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no registro:', error);
      toast.error('Erro inesperado durante o registro');
      setRegistrationMessage('Erro inesperado durante o registro');
    }
  };

  // Loading state
  if (inviteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
              <p className="text-gray-300">Verificando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              inviteRole={inviteDetails?.role?.name}
              className="mx-auto h-16 w-auto mb-4"
            />
            <CardTitle className="text-red-400 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-950 border-red-800">
              <AlertDescription className="text-red-200">
                {inviteError || 'Convite não encontrado ou expirado'}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              inviteRole={inviteDetails.role.name}
              className="mx-auto h-16 w-auto mb-4"
            />
            <CardTitle className="text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Registro Concluído!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="bg-green-950 border-green-800 mb-4">
              <AlertDescription className="text-green-200">
                {registrationMessage}
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecionando...</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <DynamicBrandLogo 
            inviteRole={inviteDetails.role.name}
            className="mx-auto h-16 w-auto mb-4"
          />
          <CardTitle className="text-white">Você foi convidado!</CardTitle>
          <CardDescription className="text-gray-300">
            Convite para se tornar <strong className="text-viverblue">{inviteDetails.role.name}</strong>
            <br />
            <span className="text-sm text-gray-400">
              Para: {inviteDetails.email}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {registrationMessage && !registrationSuccess && (
            <Alert className="mb-4 bg-red-950 border-red-800">
              <AlertDescription className="text-red-200">
                {registrationMessage}
              </AlertDescription>
            </Alert>
          )}

          <RegisterForm
            inviteToken={token}
            prefilledEmail={inviteDetails.email}
            onSuccess={handleRegistration}
            isLoading={isProcessing}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-viverblue hover:text-viverblue/80"
                onClick={() => navigate(`/login?invite=${token}`)}
              >
                Fazer login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
