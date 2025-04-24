
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { authRoutes } from './auth.routes';
import { memberRoutes } from './member.routes';
import { adminRoutes } from './admin.routes';
import RootRedirect from '@/components/routing/RootRedirect';
import { NotFound } from '@/pages/NotFound';

// Lazy-loaded layouts para melhor performance
const AuthGuard = lazy(() => import('@/components/auth/AuthGuard'));
const MemberGuard = lazy(() => import('@/components/auth/MemberGuard'));
const AdminGuard = lazy(() => import('@/components/auth/AdminGuard'));

const AppRoutes = () => {
  console.log('AppRoutes renderizando');
  
  return (
    <Routes>
      {/* Autenticação */}
      {authRoutes}
      
      {/* Rota raiz para redirecionar com base no tipo de usuário */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de Membros */}
      <Route element={
        <Suspense fallback={<LoadingScreen message="Carregando..." />}>
          <MemberGuard />
        </Suspense>
      }>
        {memberRoutes}
      </Route>

      {/* Rotas Administrativas */}
      <Route element={
        <Suspense fallback={<LoadingScreen message="Verificando permissões administrativas..." />}>
          <AdminGuard />
        </Suspense>
      }>
        {adminRoutes}
      </Route>
      
      {/* Fallback para qualquer outra rota */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
