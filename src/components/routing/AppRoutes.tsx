
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes } from '../../routes/AuthRoutes';
import { adminRoutes } from '../../routes/AdminRoutes';
import { memberRoutes } from '../../routes/MemberRoutes';
import { onboardingRoutes } from '../../routes/OnboardingRoutes';
import { formacaoRoutes } from '../../routes/FormacaoRoutes';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
      <Route path="/convite/:token" element={<InvitePage />} />
      <Route path="/convite" element={<InvitePage />} />
      
      {/* Auth Routes */}
      {authRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Member Routes */}
      {memberRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Onboarding Routes */}
      {onboardingRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Formação Routes */}
      {formacaoRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Autenticação com parâmetros de convite */}
      <Route path="/auth" element={<AuthRedirect />} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componente para processar redirecionamentos após autenticação
const AuthRedirect = () => {
  const location = window.location;
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  
  if (token) {
    // Se temos um token de convite, redirecionar para a página de convite
    return <Navigate to={`/convite/${token}`} replace />;
  }
  
  // Caso contrário, redirecionar para a dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AppRoutes;
