
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

interface SmartRedirectHandlerProps {
  children?: React.ReactNode;
}

// Rotas que requerem onboarding completo
const ONBOARDING_REQUIRED_ROUTES = [
  '/networking',
  '/implementation-trail'
];

// Rotas que NUNCA devem ser redirecionadas
const PROTECTED_ROUTES = [
  '/profile',
  '/comunidade',
  '/learning',
  '/dashboard',
  '/solutions',
  '/tools'
];

export const SmartRedirectHandler: React.FC<SmartRedirectHandlerProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/';
  const isProfileRoute = location.pathname.startsWith('/profile');
  
  const requiresOnboarding = ONBOARDING_REQUIRED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    // Lógica de redirecionamento simplificada para evitar loops
    if (!isPublicRoute && !isOnboardingRoute && !isProfileRoute) {
      // Verificar se há token de autenticação
      const hasAuth = localStorage.getItem('supabase.auth.token');
      
      if (!hasAuth) {
        navigate('/login', { replace: true });
        return;
      }

      // Se requer onboarding e não é rota protegida, redirecionar
      if (requiresOnboarding && !isProtectedRoute) {
        const onboardingComplete = localStorage.getItem('onboarding_complete');
        if (!onboardingComplete) {
          navigate('/onboarding-new', { replace: true });
        }
      }
    }
  }, [location.pathname, navigate, isPublicRoute, isOnboardingRoute, isProfileRoute, requiresOnboarding, isProtectedRoute]);

  return <>{children}</>;
};

// Redirecionamento simples sem hooks de auth para evitar dependências circulares
export const SimpleRedirectHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificação simples sem dependências do contexto de auth
    const hasAuth = localStorage.getItem('supabase.auth.token');
    const userRole = localStorage.getItem('user_role');
    
    if (hasAuth) {
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'formacao') {
        navigate('/formacao', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <LoadingScreen message="Redirecionando..." />;
};
