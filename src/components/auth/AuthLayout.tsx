
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import LoginForm from './LoginForm';

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  
  const [message, setMessage] = useState('');

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (!isLoading && user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando');
      
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location.state]);

  // Loading simples
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Carregando...
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se usuário está logado, não mostrar tela de auth
  if (user) {
    return null;
  }

  const handleSuccess = () => {
    console.log('[AUTH-LAYOUT] Login realizado com sucesso');
    
    const from = location.state?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardContent className="p-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-viverblue" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              VIVER DE IA Club
            </h1>
            <p className="text-neutral-400 text-sm">
              Acesso exclusivo por convite
            </p>
          </div>

          {/* Aviso sobre sistema de convites */}
          <Alert className="mb-6 bg-blue-500/10 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400 text-sm">
              Esta plataforma é exclusiva para membros convidados. 
              Se você tem acesso, faça login abaixo.
            </AlertDescription>
          </Alert>

          {message && (
            <Alert className="mb-4 bg-blue-500/10 border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-400">{message}</AlertDescription>
            </Alert>
          )}
          
          {/* Formulário de Login */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Fazer Login
              </h2>
              <p className="text-neutral-300 text-sm">
                Digite suas credenciais para acessar
              </p>
            </div>
            <LoginForm onSuccess={handleSuccess} />
          </div>

          {/* Link para suporte */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-neutral-400 text-xs">
              Não tem acesso? Entre em contato para receber um convite.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
