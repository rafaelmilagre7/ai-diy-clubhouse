
import { Routes, Route } from 'react-router-dom';
import MemberGuard from '@/components/auth/MemberGuard';
import { memberRoutes } from '@/routes/member.routes';

/**
 * MemberRoutes - Configuração de rotas para membros
 * Encapsula as rotas de membros com o MemberGuard
 */
const MemberRoutes = () => {
  return (
    <Routes>
      <Route element={<MemberGuard />}>
        {memberRoutes}
      </Route>
    </Routes>
  );
};

export default MemberRoutes;
