
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Administrativas */}
        <Route path="/admin" element={<AdminProtectedRoutes />}>
          <Route path="solutions" element={<AdminSolutions />} />
          <Route path="solutions/:id" element={<AdminSolutionEdit />} />
          <Route path="solutions/new" element={<AdminSolutionEdit />} />
        </Route>
        
        {/* Fallback para qualquer outra rota */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
