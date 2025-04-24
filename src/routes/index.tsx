
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { memberRoutes } from './member.routes';
import { adminRoutes } from './admin.routes';
import { authRoutes } from './auth.routes';
import RootRedirect from '@/components/routing/RootRedirect';
import { NotFound } from '@/pages/NotFound';

const AppRoutes = () => {
  console.log('AppRoutes renderizando - Rota atual:', window.location.pathname);
  
  return (
    <Routes>
      {/* Autenticação */}
      {authRoutes}
      
      {/* Rota raiz para redirecionar com base no tipo de usuário */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de Membros - com proteção de autenticação */}
      <Route element={<ProtectedRoutes />}>
        {memberRoutes}
      </Route>

      {/* Rotas Administrativas - com proteção de admin */}
      <Route element={<AdminProtectedRoutes />}>
        {adminRoutes}
      </Route>
      
      {/* Fallback para qualquer outra rota */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
