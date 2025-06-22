
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  console.log('[ENHANCED-INVITE-REGISTRATION] Renderizando com token:', token ? `${token.substring(0, 8)}...` : 'não fornecido');
  
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Força o cache a ser limpo adicionando timestamp
    const timestamp = Date.now();
    
    if (token) {
      console.log('[ENHANCED-INVITE-REGISTRATION] Redirecionando para /auth com token');
      // Redirecionar para /auth com o token como parâmetro e timestamp para evitar cache
      navigate(`/auth?token=${token}&t=${timestamp}`, { replace: true });
    } else {
      console.log('[ENHANCED-INVITE-REGISTRATION] Redirecionando para /auth sem token');
      // Se não há token, redirecionar para auth normal
      navigate(`/auth?t=${timestamp}`, { replace: true });
    }
  }, [token, navigate]);

  // Enquanto redireciona, mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para registro...</p>
      </div>
    </div>
  );
};
