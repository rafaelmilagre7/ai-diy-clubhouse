
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import LoginForm from './LoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';
import { contrastClasses } from '@/lib/contrastUtils';

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

  // Redirecionar para página específica de convite se houver token
  useEffect(() => {
    if (inviteToken && !user) {
      console.log('[AUTH-LAYOUT] Convite detectado, redirecionando para página específica');
      navigate(`/convite-aceitar?token=${inviteToken}`, { replace: true });
      return;
    }
  }, [inviteToken, user, navigate]);

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando...');
      
      if (inviteToken) {
        console.log('[AUTH-LAYOUT] Usuário logado com convite, redirecionando para onboarding');
        navigate('/onboarding');
      } else {
        console.log('[AUTH-LAYOUT] Usuário logado sem convite, redirecionando para dashboard');
        navigate('/dashboard');
      }
    }
  }, [user, inviteToken, navigate]);

  const handleSuccess = () => {
    console.log('[AUTH-LAYOUT] Sucesso na autenticação, redirecionando...');
    if (inviteToken) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <h2 className={`text-xl font-semibold ${contrastClasses.heading}`}>
              Redirecionando...
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          {message && (
            <Alert className="mb-4 bg-blue-500/10 border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400">{message}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#252842] border-white/10">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-viverblue data-[state=active]:text-white text-neutral-300"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-viverblue data-[state=active]:text-white text-neutral-300"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className={`text-2xl font-bold ${contrastClasses.heading}`}>
                    Entrar na conta
                  </h2>
                  <p className={contrastClasses.secondary}>
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
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
