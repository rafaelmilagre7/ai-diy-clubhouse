
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import LoginForm from './LoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showRegister, setShowRegister] = useState(false);

  console.log('[AUTH-LAYOUT] Renderizando para usuário:', user ? user.email : 'não logado');

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando para dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    console.log('[AUTH-LAYOUT] Sucesso na autenticação, redirecionando para dashboard');
    navigate('/dashboard');
  };

  const toggleMode = () => {
    setShowRegister(!showRegister);
  };

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Redirecionando...
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {showRegister ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            {showRegister 
              ? 'Cadastre-se para acessar a plataforma'
              : 'Faça login para continuar'
            }
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {showRegister ? (
            <SimpleRegisterForm onSuccess={handleSuccess} />
          ) : (
            <LoginForm onSuccess={handleSuccess} />
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showRegister 
                ? 'Já tem uma conta? Faça login'
                : 'Não tem conta? Cadastre-se'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
