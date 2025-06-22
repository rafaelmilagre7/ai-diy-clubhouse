
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  console.log('[ENHANCED-INVITE-REGISTRATION] Renderizando com token:', token);
  
  // Redirecionar para AuthLayout que já tem toda a lógica
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (token) {
      // Redirecionar para /auth com o token como parâmetro
      navigate(`/auth?token=${token}`, { replace: true });
    } else {
      // Se não há token, redirecionar para auth normal
      navigate('/auth', { replace: true });
    }
  }, [token, navigate]);

  // Enquanto redireciona, mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};
