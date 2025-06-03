
import { Navigate } from "react-router-dom";

/**
 * Este componente está sendo mantido apenas por compatibilidade.
 * As rotas dos membros agora são gerenciadas em src/routes/MemberRoutes.tsx
 */
const MemberRoutes = () => {
  // Redirecionar para o dashboard
  return <Navigate to="/" replace />;
};

export default MemberRoutes;
