
import { Routes, Route } from 'react-router-dom';
import ModernLogin from '@/pages/auth/ModernLogin';
import Dashboard from '@/pages/member/Dashboard';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<ModernLogin />} />
      
      {/* Rota protegida do dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoutes>
          <Dashboard />
        </ProtectedRoutes>
      } />
      
      {/* Rota raiz redireciona para login se não autenticado */}
      <Route path="/" element={<ModernLogin />} />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<ModernLogin />} />
    </Routes>
  );
};

export default AppRoutes;
