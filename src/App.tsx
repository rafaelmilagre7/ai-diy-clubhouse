import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminSolutionList from "./pages/admin/AdminSolutionList";
import AdminToolList from "./pages/admin/AdminToolList";
import AdminSolutionCreate from "./pages/admin/AdminSolutionCreate";
import AdminSolutionEdit from "./pages/admin/AdminSolutionEdit";
import AdminToolCreate from "./pages/admin/AdminToolCreate";
import AdminToolEdit from "./pages/admin/AdminToolEdit";
import AdminFormacaoPage from "./pages/admin/AdminFormacaoPage";
import ModuleEditPage from "./pages/admin/ModuleEditPage";
import MemberLearningPage from "./pages/formacao/MemberLearningPage";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import AdminProtectedRoutes from "./auth/AdminProtectedRoutes";
import FormacaoProtectedRoutes from "./auth/FormacaoProtectedRoutes";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./contexts/auth";
import MemberRoutes from "./routes/memberRoutes";

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota raiz redireciona para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas públicas */}
            <Route path="/login" element={<div>Login Page</div>} />
            
            {/* Rotas protegidas para membros */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<div>Dashboard do Membro</div>} />
              <Route path="/learning" element={<MemberLearningPage />} />
              {/* Outras rotas de membro */}
            </Route>
            
            {/* Rotas protegidas para administradores */}
            <Route element={<AdminProtectedRoutes />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/solutions" element={<AdminSolutionList />} />
              <Route path="/admin/solutions/new" element={<AdminSolutionCreate />} />
              <Route path="/admin/solutions/:id" element={<AdminSolutionEdit />} />
              <Route path="/admin/tools" element={<AdminToolList />} />
              <Route path="/admin/tools/new" element={<AdminToolCreate />} />
              <Route path="/admin/tools/:id" element={<AdminToolEdit />} />
              <Route path="/admin/modules/:id" element={<ModuleEditPage />} />
              {/* Outras rotas admin */}
            </Route>
            
            {/* Rotas protegidas para equipe de formação */}
            <Route element={<FormacaoProtectedRoutes />}>
              <Route path="/formacao" element={<AdminFormacaoPage />} />
              <Route path="/formacao/aulas" element={<div>Gerenciamento de Aulas</div>} />
              {/* Outras rotas de formação */}
            </Route>
            
            {/* Rota 404 */}
            <Route path="*" element={<div>Página não encontrada</div>} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
