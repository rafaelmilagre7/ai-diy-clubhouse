
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/auth";
import { ProtectedRoutes } from "./auth/ProtectedRoutes";
import { AdminProtectedRoutes } from "./auth/AdminProtectedRoutes";
import { FormacaoProtectedRoutes } from "./auth/FormacaoProtectedRoutes";
import MemberLearningPage from "./pages/formacao/MemberLearningPage";

// Criação do cliente de query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  }
});

// QueryProvider simplificado
const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

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
            <Route element={<ProtectedRoutes><Outlet /></ProtectedRoutes>}>
              <Route path="/dashboard" element={<div>Dashboard do Membro</div>} />
              <Route path="/learning" element={<MemberLearningPage />} />
              {/* Rotas dinâmicas de cursos */}
              <Route path="/course/:id" element={<div>Visualização de Curso</div>} />
              <Route path="/course/:courseId/lesson/:lessonId" element={<div>Visualização de Aula</div>} />
            </Route>
            
            {/* Rotas protegidas para administradores */}
            <Route element={<AdminProtectedRoutes><Outlet /></AdminProtectedRoutes>}>
              <Route path="/admin" element={<div>Painel de Administração</div>} />
              <Route path="/admin/solutions" element={<div>Lista de Soluções</div>} />
              <Route path="/admin/solutions/new" element={<div>Criar Nova Solução</div>} />
              <Route path="/admin/solutions/:id" element={<div>Editar Solução</div>} />
              <Route path="/admin/tools" element={<div>Lista de Ferramentas</div>} />
              <Route path="/admin/tools/new" element={<div>Criar Nova Ferramenta</div>} />
              <Route path="/admin/tools/:id" element={<div>Editar Ferramenta</div>} />
              <Route path="/admin/modules/:id" element={<div>Editar Módulo</div>} />
            </Route>
            
            {/* Rotas protegidas para equipe de formação */}
            <Route element={<FormacaoProtectedRoutes><Outlet /></FormacaoProtectedRoutes>}>
              <Route path="/formacao" element={<div>Painel de Formação</div>} />
              <Route path="/formacao/aulas" element={<div>Gerenciamento de Aulas</div>} />
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
