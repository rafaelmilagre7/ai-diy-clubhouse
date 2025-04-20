
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";

/**
 * MemberRoutes configura as rotas para membros da aplicação
 */
const MemberRoutes = ({ children }: { children: ReactNode }) => {
  // Implementação simplificada das rotas de membro
  return (
    <Routes>
      <Route path="/" element={<MemberLayout>{children}</MemberLayout>} />
    </Routes>
  );
};

export { MemberRoutes };
