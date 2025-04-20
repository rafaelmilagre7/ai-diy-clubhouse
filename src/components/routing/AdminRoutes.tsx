
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";

interface AdminRoutesProps {
  children: ReactNode;
}

/**
 * AdminRoutes configura as rotas administrativas da aplicação
 */
const AdminRoutes = ({ children }: AdminRoutesProps) => {
  // Implementação simplificada das rotas de administrador
  return (
    <Routes>
      <Route path="/" element={<AdminLayout>{children}</AdminLayout>} />
    </Routes>
  );
};

export { AdminRoutes };
