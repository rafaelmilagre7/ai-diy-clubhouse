
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { RegisterForm } from './RegisterForm';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { registerWithInvite, applyInviteToExistingUser, isProcessing } = useInviteFlow();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  
  const [registrationStep, setRegistrationStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar se já existe usuário logado
  useEffect(() => {
    if (user && inviteDetails && !isProcessing) {
      console.log('[ENHANCED-INVITE] Usuário já logado, aplicando convite automaticamente');
      handleExistingUserInvite();
    } else if (inviteDetails && !user) {
      console.log('[ENHANCED-INVITE] Convite válido, mostrar formulário de registro');
      setRegistrationStep('form');
    }
  }, [user, inviteDetails]);

  const handleExistingUserInvite = async () => {
    if (!token) return;

    try {
      const result = await applyInviteToExistingUser(token);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Convite aplicado com sucesso!');
        setRegistrationStep('success');
        
        // Redirecionar após sucesso
        setTimeout(() => {
          navigate(result.redirectPath || '/dashboard');
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Erro ao aplicar convite');
        setRegistrationStep('error');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro ao aplicar convite:', error);
      setErrorMessage('Erro inesperado ao aplicar convite');
      setRegistrationStep('error');
    }
  };

  const handleRegistrationSuccess = async (formData: { email: string; password: string; name: string }) => {
    if (!token) {
      setErrorMessage('Token de convite não encontrado');
      setRegistrationStep('error');
      return;
    }

    try {
      console.log('[ENHANCED-INVITE] Processando registro com convite:', formData);
      
      const result = await registerWithInvite(
        token,
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success) {
        setSuccessMessage(result.message || 'Registro realizado com sucesso!');
        setRegistrationStep('success');
        
        toast({
          title: "Sucesso!",
          description: result.message,
        });

        // Redirecionar após sucesso
        setTimeout(() => {
          navigate(result.redirectPath || '/dashboard');
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Erro no registro');
        setRegistrationStep('error');
      }
    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no registro:', error);
      setErrorMessage('Erro inesperado durante o registro');
      setRegistrationStep('error');
    }
  };

  const handleRegistrationError = (error: string) => {
    setErrorMessage(error);
    setRegistrationStep('error');
  };

  // Loading state
  if (inviteLoading || registrationStep === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <DynamicBrandLogo 
              inviteRole={inviteDetails?.role?.name}
              className="mb-6 h-16 w-auto"
            />
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 text-center">Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (inviteError || registrationStep === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              className="mb-4 h-16 w-auto mx-auto"
            />
            <CardTitle className="text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erro no Convite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage || inviteError || 'Erro desconhecido'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                Voltar à página inicial
              </Button>
              
              {token && (
                <Button 
                  onClick={() => {
                    setRegistrationStep('loading');
                    setErrorMessage('');
                    window.location.reload();
                  }}
                  className="w-full"
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (registrationStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              inviteRole={inviteDetails?.role?.name}
              className="mb-4 h-16 w-auto mx-auto"
            />
            <CardTitle className="text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Redirecionando automaticamente...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form state
  if (registrationStep === 'form' && inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              inviteRole={inviteDetails.role?.name}
              className="mb-4 h-16 w-auto mx-auto"
            />
            <CardTitle>Complete seu Cadastro</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Você foi convidado como <strong>{inviteDetails.role?.name}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <ArrowRight className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Email:</strong> {inviteDetails.email}<br />
                <strong>Cargo:</strong> {inviteDetails.role?.name}
                {inviteDetails.role?.description && (
                  <>
                    <br />
                    <strong>Descrição:</strong> {inviteDetails.role.description}
                  </>
                )}
              </AlertDescription>
            </Alert>

            <RegisterForm
              defaultEmail={inviteDetails.email}
              inviteToken={token}
              onSuccess={handleRegistrationSuccess}
              onError={handleRegistrationError}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default EnhancedInviteRegistration;
