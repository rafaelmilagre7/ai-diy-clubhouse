
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";

/**
 * AdminRoutes configura as rotas administrativas da aplicação
 */
const AdminRoutes = ({ children }: { children: ReactNode }) => {
  // Implementação simplificada das rotas de administrador
  return (
    <Routes>
      <Route path="/" element={<AdminLayout>{children}</AdminLayout>} />
    </Routes>
  );
};

export { AdminRoutes };
