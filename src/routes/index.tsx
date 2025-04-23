
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { memberRoutes } from './member.routes';
import { adminRoutes } from './admin.routes';
import RootRedirect from '@/components/routing/RootRedirect';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota raiz para redirecionar com base no tipo de usuário */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de Membros */}
      <Route element={<ProtectedRoutes />}>
        {memberRoutes}
      </Route>

      {/* Rotas Administrativas */}
      <Route element={<AdminProtectedRoutes />}>
        {adminRoutes}
      </Route>
      
      {/* Fallback para qualquer outra rota */}
      <Route path="*" element={<div>Página não encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;
