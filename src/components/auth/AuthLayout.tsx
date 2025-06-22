
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import LoginForm from './LoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';

const AuthLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyInviteToExistingUser } = useInviteFlow();
  
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);

  const inviteToken = searchParams.get('token');
  const email = searchParams.get('email');

  // Processar convite para usuário logado
  useEffect(() => {
    const processExistingUserInvite = async () => {
      if (inviteToken && user && !isProcessingInvite) {
        setIsProcessingInvite(true);
        
        try {
          console.log('[AUTH-LAYOUT] Processando convite para usuário logado:', {
            token: inviteToken,
            userEmail: user.email
          });

          const result = await applyInviteToExistingUser(inviteToken);
          
          if (result.success) {
            setMessage(result.message || 'Convite aplicado com sucesso!');
            
            setTimeout(() => {
              if (result.shouldRedirectToOnboarding) {
                navigate('/onboarding');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          } else {
            setMessage(result.message || 'Erro ao aplicar convite');
          }
        } catch (error) {
          console.error('[AUTH-LAYOUT] Erro inesperado:', error);
          setMessage('Erro inesperado ao processar convite');
        } finally {
          setIsProcessingInvite(false);
        }
      }
    };

    processExistingUserInvite();
  }, [inviteToken, user, applyInviteToExistingUser, navigate, isProcessingInvite]);

  // Redirecionar usuário autenticado sem convite
  useEffect(() => {
    if (user && !inviteToken) {
      navigate('/dashboard');
    }
  }, [user, inviteToken, navigate]);

  // Mostrar tab de registro se houver convite
  useEffect(() => {
    if (inviteToken && !user) {
      setActiveTab('register');
    }
  }, [inviteToken, user]);

  // Se usuário logado está processando convite
  if (user && inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h2 className="text-xl font-semibold">
              {isProcessingInvite ? 'Processando convite...' : 'Convite processado'}
            </h2>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    // Redirecionar para onboarding se novo usuário, ou dashboard se existente
    if (inviteToken) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {message && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">
                {inviteToken ? 'Cadastrar' : 'Criar conta'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Entrar na conta</h2>
                  <p className="text-gray-600">
                    Acesse sua conta para continuar
                  </p>
                </div>
                <LoginForm onSuccess={handleSuccess} />
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <SimpleRegisterForm 
                onSuccess={handleSuccess}
                defaultEmail={email || ''}
                inviteToken={inviteToken || undefined}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
