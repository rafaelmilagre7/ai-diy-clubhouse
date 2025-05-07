
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Layout from "./components/layout/Layout";
import FormacaoLayout from "./components/layout/formacao/FormacaoLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Formação Pages
import FormacaoHomePage from "./pages/formacao/FormacaoHomePage";
import FormacaoAulasPage from "./pages/formacao/FormacaoAulasPage";
import FormacaoAulaNova from "./pages/formacao/FormacaoAulaNova";
import FormacaoAulaNovaVideos from "./pages/formacao/FormacaoAulaNovaVideos";
import FormacaoAulaNovaMateriais from "./pages/formacao/FormacaoAulaNovaMateriais";
import FormacaoAulaNovaPublicacao from "./pages/formacao/FormacaoAulaNovaPublicacao";

// Membro Pages
import MemberCursosPage from "./pages/membro/MemberCursosPage";
import MemberCursoDetailPage from "./pages/membro/MemberCursoDetailPage";
import MemberAulaPage from "./pages/membro/MemberAulaPage";

// Protected Routes
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import FormacaoRoute from "./components/auth/FormacaoRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<SignupPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            {/* Formação Routes */}
            <Route
              path="/formacao"
              element={
                <FormacaoRoute>
                  <FormacaoLayout>
                    <FormacaoHomePage />
                  </FormacaoLayout>
                </FormacaoRoute>
              }
            >
              <Route index element={<FormacaoHomePage />} />
              <Route path="aulas" element={<FormacaoAulasPage />} />
              <Route path="aulas/nova" element={<FormacaoAulaNova />} />
              <Route path="aulas/nova/videos" element={<FormacaoAulaNovaVideos />} />
              <Route path="aulas/nova/materiais" element={<FormacaoAulaNovaMateriais />} />
              <Route path="aulas/nova/publicacao" element={<FormacaoAulaNovaPublicacao />} />
              {/* Adicionar outras rotas de formação conforme necessário */}
            </Route>

            {/* Membro Routes */}
            <Route
              path="/membro"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MemberCursosPage />
                  </Layout>
                </ProtectedRoute>
              }
            >
              <Route path="cursos" element={<MemberCursosPage />} />
              <Route path="curso/:cursoId" element={<MemberCursoDetailPage />} />
              <Route path="aula/:aulaId" element={<MemberAulaPage />} />
            </Route>

            {/* Outras rotas conforme necessário */}
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
