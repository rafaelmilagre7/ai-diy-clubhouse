
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

// Redirecionamento simples sem hooks de auth para evitar dependências circulares
export const SimpleRedirectHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SimpleRedirectHandler: Iniciando verificação de redirecionamento');
    
    // Verificação simples sem dependências do contexto de auth
    const hasAuth = localStorage.getItem('supabase.auth.token');
    const userRole = localStorage.getItem('user_role');
    
    console.log('SimpleRedirectHandler: hasAuth =', !!hasAuth);
    console.log('SimpleRedirectHandler: userRole =', userRole);
    
    if (hasAuth) {
      if (userRole === 'admin') {
        console.log('SimpleRedirectHandler: Redirecionando para /admin');
        navigate('/admin', { replace: true });
      } else if (userRole === 'formacao') {
        console.log('SimpleRedirectHandler: Redirecionando para /formacao');
        navigate('/formacao', { replace: true });
      } else {
        console.log('SimpleRedirectHandler: Redirecionando para /dashboard');
        navigate('/dashboard', { replace: true });
      }
    } else {
      console.log('SimpleRedirectHandler: Redirecionando para /login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <LoadingScreen message="Redirecionando..." />;
};
