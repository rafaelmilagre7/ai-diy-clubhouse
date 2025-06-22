
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import LoginForm from './LoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';

const AuthLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');

  const inviteToken = searchParams.get('token');
  const email = searchParams.get('email');

  console.log('[AUTH-LAYOUT] Renderizando com parâmetros:', {
    inviteToken: inviteToken ? `${inviteToken.substring(0, 8)}...` : null,
    email,
    user: user ? user.email : null
  });

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando...');
      
      // Se há token de convite, o sistema já aplicou automaticamente via trigger
      // Redirecionar direto para onboarding se necessário, ou dashboard
      if (inviteToken) {
        console.log('[AUTH-LAYOUT] Usuário logado com convite, redirecionando para onboarding');
        navigate('/onboarding');
      } else {
        console.log('[AUTH-LAYOUT] Usuário logado sem convite, redirecionando para dashboard');
        navigate('/dashboard');
      }
    }
  }, [user, inviteToken, navigate]);

  // Mostrar tab de registro se houver convite
  useEffect(() => {
    if (inviteToken && !user) {
      console.log('[AUTH-LAYOUT] Convite detectado, definindo tab para registro');
      setActiveTab('register');
    }
  }, [inviteToken, user]);

  const handleSuccess = () => {
    console.log('[AUTH-LAYOUT] Sucesso na autenticação, redirecionando...');
    // Redirecionar para onboarding se novo usuário, ou dashboard se existente
    if (inviteToken) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h2 className="text-xl font-semibold">Redirecionando...</h2>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {inviteToken ? 'Aceitar Convite' : 'Criar conta'}
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
