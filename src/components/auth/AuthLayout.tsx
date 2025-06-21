
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

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
            
            // Aguardar um pouco antes de redirecionar
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
          <CardHeader>
            <CardTitle className="text-center">
              {isProcessingInvite ? 'Processando convite...' : 'Convite processado'}
            </CardTitle>
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
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {inviteToken ? 'Complete seu cadastro' : 'Acesse sua conta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSuccess={handleSuccess} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm 
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
