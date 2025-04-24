
import { Routes, Route } from 'react-router-dom';
import AdminGuard from '@/components/auth/AdminGuard';
import { adminRoutes } from '@/routes/admin.routes';

/**
 * AdminRoutes - Configuração de rotas para administradores
 * Encapsula as rotas de administradores com o AdminGuard
 */
const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminGuard />}>
        {adminRoutes}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
