import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SimpleAuthProvider } from "@/contexts/auth/SimpleAuthProvider";
import { EmergencyResetButton } from "@/components/common/EmergencyResetButton";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import ProtectedRoute from "@/auth/ProtectedRoute";
import { RobustProtectedRoutes } from "@/auth/RobustProtectedRoutes";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTools from "@/pages/admin/AdminTools";
import AdminToolsEdit from "@/pages/admin/AdminToolsEdit";
import AdminToolsNew from "@/pages/admin/AdminToolsNew";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import RootRedirect from "@/components/routing/RootRedirect";
import RobustRootRedirect from "@/components/routing/RobustRootRedirect";
import AuthSession from "@/components/auth/AuthSession";
import InviteInterceptor from "@/components/auth/InviteInterceptor";
import PricingPage from "@/pages/PricingPage";
import AccountSettings from "@/pages/AccountSettings";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MemberLayout } from "@/components/layout/MemberLayout";
import { PricingLayout } from "@/components/layout/PricingLayout";
import { DocsPage } from "@/pages/docs/DocsPage";
import { DocsLayout } from "@/components/layout/DocsLayout";
import { ForumHome } from "@/pages/forum/ForumHome";
import { ForumLayout } from "@/components/layout/ForumLayout";
import { ForumPost } from "@/pages/forum/ForumPost";
import { ForumNewPost } from "@/pages/forum/ForumNewPost";
import { FormacaoDashboard } from "@/pages/formacao/FormacaoDashboard";
import { FormacaoLayout } from "@/components/layout/FormacaoLayout";
import { LearningCourses } from "@/pages/formacao/LearningCourses";
import { LearningLessons } from "@/pages/formacao/LearningLessons";
import { LearningNewCourse } from "@/pages/formacao/LearningNewCourse";
import { LearningNewLesson } from "@/pages/formacao/LearningNewLesson";
import { LearningMaterials } from "@/pages/formacao/LearningMaterials";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { AdminRoleSync } from "@/pages/admin/AdminRoleSync";
import { useAuth } from "@/contexts/auth";

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1, // Reduzir tentativas para evitar loops
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<PricingLayout><PricingPage /></PricingLayout>} />
              
              {/* Rotas protegidas */}
              <Route element={<RobustProtectedRoutes />}>
                <Route element={<AuthSession />}>
                  <Route path="/" element={<RobustRootRedirect />} />
                  <Route path="/dashboard" element={<MemberLayout><Dashboard /></MemberLayout>} />
                  <Route path="/account" element={<MemberLayout><AccountSettings /></MemberLayout>} />
                </Route>
              </Route>

              {/* Onboarding */}
              <Route element={<RobustProtectedRoutes allowInviteFlow />}>
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>
              
              {/* Rotas de administração */}
              <Route path="/admin" element={<RobustProtectedRoutes />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="tools" element={<AdminTools />} />
                  <Route path="tools/new" element={<AdminToolsNew />} />
                  <Route path="tools/:id" element={<AdminToolsEdit />} />
                  <Route path="rolesync" element={<AdminRoleSync />} />
                </Route>
              </Route>

              {/* Rotas de formação */}
              <Route path="/formacao" element={<RobustProtectedRoutes />}>
                <Route element={<FormacaoLayout />}>
                  <Route index element={<FormacaoDashboard />} />
                  <Route path="cursos" element={<LearningCourses />} />
                  <Route path="cursos/novo" element={<LearningNewCourse />} />
                  <Route path="aulas" element={<LearningLessons />} />
                  <Route path="aulas/nova" element={<LearningNewLesson />} />
                  <Route path="materiais" element={<LearningMaterials />} />
                </Route>
              </Route>

              {/* Rotas da comunidade */}
              <Route path="/forum" element={<RobustProtectedRoutes />}>
                <Route element={<ForumLayout />}>
                  <Route index element={<ForumHome />} />
                  <Route path="new" element={<ForumNewPost />} />
                  <Route path=":postId" element={<ForumPost />} />
                </Route>
              </Route>

              {/* Rotas da documentação */}
              <Route path="/docs" element={<RobustProtectedRoutes />}>
                <Route element={<DocsLayout />}>
                  <Route index element={<DocsPage />} />
                </Route>
              </Route>

              {/* Interceptor de convites */}
              <Route path="/invite" element={<ProtectedRoutes allowInviteFlow />}>
                <Route element={<InviteInterceptor />} />
              </Route>
            </Routes>
            
            {/* Botão de emergência global */}
            <EmergencyResetButton />
          </BrowserRouter>
        </TooltipProvider>
      </SimpleAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
