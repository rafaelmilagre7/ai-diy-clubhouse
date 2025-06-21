
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { RegisterForm } from './RegisterForm';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({
  token
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { registerWithInvite, applyInviteToExistingUser, isProcessing } = useInviteFlow();
  const { inviteDetails, loading: detailsLoading, error: detailsError } = useInviteDetails(token);

  const [currentStep, setCurrentStep] = useState<'loading' | 'register' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Verificar se o usuário já está logado
  useEffect(() => {
    if (user && token && inviteDetails) {
      handleExistingUserInvite();
    } else if (!detailsLoading && inviteDetails) {
      setCurrentStep('register');
    } else if (!detailsLoading && detailsError) {
      setErrorMessage(detailsError);
      setCurrentStep('error');
    }
  }, [user, token, inviteDetails, detailsLoading, detailsError]);

  const handleExistingUserInvite = async () => {
    if (!token) return;

    try {
      const result = await applyInviteToExistingUser(token);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Convite aplicado com sucesso!');
        setCurrentStep('success');
        
        toast({
          title: "Sucesso!",
          description: result.message,
        });

        setTimeout(() => {
          navigate(result.redirectPath || '/dashboard');
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Erro ao aplicar convite');
        setCurrentStep('error');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro ao aplicar convite para usuário existente:', error);
      setErrorMessage('Erro inesperado ao aplicar convite');
      setCurrentStep('error');
    }
  };

  const handleRegistrationSuccess = async () => {
    setSuccessMessage('Conta criada e convite aplicado com sucesso!');
    setCurrentStep('success');
    
    toast({
      title: "Bem-vindo!",
      description: "Sua conta foi criada com sucesso.",
    });

    setTimeout(() => {
      navigate('/onboarding');
    }, 2000);
  };

  const handleRegistrationError = (error: string) => {
    setErrorMessage(error);
    setCurrentStep('error');
    
    toast({
      title: "Erro no registro",
      description: error,
      variant: "destructive"
    });
  };

  const handleRegisterWithInvite = async (formData: {
    email: string;
    password: string;
    name: string;
  }) => {
    if (!token) {
      handleRegistrationError('Token de convite não encontrado');
      return;
    }

    try {
      const result = await registerWithInvite(
        token,
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success) {
        handleRegistrationSuccess();
      } else {
        handleRegistrationError(result.message || 'Erro no registro');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no registro com convite:', error);
      handleRegistrationError('Erro inesperado durante o registro');
    }
  };

  // Estado de carregamento
  if (detailsLoading || currentStep === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-center text-gray-600">
              Validando convite...
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStep === 'register' && 'Criar Conta'}
              {currentStep === 'success' && 'Sucesso!'}
              {currentStep === 'error' && 'Erro'}
            </h1>
            
            {inviteDetails && currentStep === 'register' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Você foi convidado para se juntar como:
                </p>
                <p className="font-semibold text-blue-600">
                  {inviteDetails.role.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Email: {inviteDetails.email}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {currentStep === 'register' && (
            <div className="space-y-4">
              <RegisterForm
                defaultEmail={inviteDetails?.email || ''}
                inviteToken={token}
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {successMessage}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                Redirecionando...
              </p>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Processando...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
