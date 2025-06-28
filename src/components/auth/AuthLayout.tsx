
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { LoginForm } from './LoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');

  console.log('[AUTH-LAYOUT] Renderizando para usuário:', user ? user.email : 'não logado');

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando para dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Redirecionando...
            </h2>
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
                  <h2 className="text-2xl font-bold text-white">
                    Entrar na conta
                  </h2>
                  <p className="text-neutral-300">
                    Acesse sua conta para continuar
                  </p>
                </div>
                <LoginForm />
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <SimpleRegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
