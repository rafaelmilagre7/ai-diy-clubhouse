
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { authRoutes } from './auth.routes';
import { memberRoutes } from './member.routes';
import { adminRoutes } from './admin.routes';
import RootRedirect from '@/components/routing/RootRedirect';
import { NotFound } from '@/pages/NotFound';
import AuthGuard from '@/components/auth/AuthGuard';

/**
 * AppRoutes - Configuração principal de rotas da aplicação
 * Organiza as rotas públicas, de membros e administrativas
 */
const AppRoutes = () => {
  console.log('AppRoutes renderizando');
  
  return (
    <Routes>
      {/* Autenticação - Rotas públicas */}
      {authRoutes}
      
      {/* Rota raiz para redirecionar com base no tipo de usuário */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas protegidas - Requer autenticação */}
      <Route element={<AuthGuard />}>
        {/* Rotas de membros */}
        <Route path="/dashboard/*" element={<Suspense fallback={<LoadingScreen message="Carregando dashboard..." />}>
          <MemberRoutes />
        </Suspense>} />

        {/* Rotas administrativas */}
        <Route path="/admin/*" element={<Suspense fallback={<LoadingScreen message="Carregando área administrativa..." />}>
          <AdminRoutes />
        </Suspense>} />
      </Route>
      
      {/* Fallback para qualquer outra rota */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componentes lazy-loaded para melhor performance
const MemberRoutes = lazy(() => import('@/components/routing/MemberRoutes'));
const AdminRoutes = lazy(() => import('@/components/routing/AdminRoutes'));

export default AppRoutes;
