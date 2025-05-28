import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';

// Import pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import Dashboard from '@/pages/Dashboard';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Users from '@/pages/admin/Users';
import Courses from '@/pages/admin/Courses';
import EditCourse from '@/pages/admin/EditCourse';
import CreateCourse from '@/pages/admin/CreateCourse';
import Module from '@/pages/admin/Module';
import EditModule from '@/pages/admin/EditModule';
import CreateModule from '@/pages/admin/CreateModule';
import Topic from '@/pages/admin/Topic';
import EditTopic from '@/pages/admin/EditTopic';
import CreateTopic from '@/pages/admin/CreateTopic';
import ImplementationTrail from '@/pages/ImplementationTrail';
import LearningHome from '@/pages/learning/LearningHome';
import LearningModule from '@/pages/learning/LearningModule';
import LearningTopic from '@/pages/learning/LearningTopic';
import LearningCompleted from '@/pages/learning/LearningCompleted';
import LearningReview from '@/pages/learning/LearningReview';
import LearningCertificate from '@/pages/learning/LearningCertificate';
import FormationHome from '@/pages/formation/FormationHome';
import FormationModule from '@/pages/formation/FormationModule';
import FormationTopic from '@/pages/formation/FormationTopic';
import FormationCompleted from '@/pages/formation/FormationCompleted';
import FormationReview from '@/pages/formation/FormationReview';
import FormationCertificate from '@/pages/formation/FormationCertificate';
import ForumHome from '@/pages/forum/ForumHome';
import ForumTopic from '@/pages/forum/ForumTopic';
import ForumCreateTopic from '@/pages/forum/ForumCreateTopic';
import ForumEditTopic from '@/pages/forum/ForumEditTopic';
import ForumPost from '@/pages/forum/ForumPost';
import ForumCreatePost from '@/pages/forum/ForumCreatePost';
import ForumEditPost from '@/pages/forum/ForumEditPost';
import Profile from '@/pages/profile/Profile';
import EditProfile from '@/pages/profile/EditProfile';
import Billing from '@/pages/profile/Billing';
import Notifications from '@/pages/profile/Notifications';
import Security from '@/pages/profile/Security';
import Integrations from '@/pages/profile/Integrations';
import DeleteAccount from '@/pages/profile/DeleteAccount';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-new-password" element={<SetNewPassword />} />
              
              {/* Redirecionamento do onboarding antigo para o novo */}
              <Route 
                path="/onboarding" 
                element={<Navigate to="/onboarding-new" replace />} 
              />
              
              {/* Novo sistema de onboarding */}
              <Route 
                path="/onboarding-new" 
                element={<ProtectedRoutes><NovoOnboardingNew /></ProtectedRoutes>} 
              />
              <Route 
                path="/onboarding-new/completed" 
                element={<ProtectedRoutes><OnboardingCompletedNewPage /></ProtectedRoutes>} 
              />
              
              {/* Onboarding antigo (mantido para compatibilidade) */}
              <Route 
                path="/onboarding-legacy" 
                element={<ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>} 
              />
              <Route 
                path="/onboarding/completed" 
                element={<ProtectedRoutes><OnboardingCompleted /></ProtectedRoutes>} 
              />

              {/* Dashboard */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} 
              />
              
              {/* Rota raiz redireciona para dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rotas de administração */}
              <Route path="/admin" element={<AdminProtectedRoutes><AdminDashboard /></AdminProtectedRoutes>} />
              <Route path="/admin/users" element={<AdminProtectedRoutes><Users /></AdminProtectedRoutes>} />
              <Route path="/admin/courses" element={<AdminProtectedRoutes><Courses /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/create" element={<AdminProtectedRoutes><CreateCourse /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/:courseId" element={<AdminProtectedRoutes><EditCourse /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/:courseId/modules/create" element={<AdminProtectedRoutes><CreateModule /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId" element={<AdminProtectedRoutes><EditModule /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/topics/create" element={<AdminProtectedRoutes><CreateTopic /></AdminProtectedRoutes>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/topics/:topicId" element={<AdminProtectedRoutes><EditTopic /></AdminProtectedRoutes>} />
              
              {/* Rotas de trilha de implementação */}
              <Route path="/implementation-trail" element={<ProtectedRoutes><ImplementationTrail /></ProtectedRoutes>} />

              {/* Rotas de aprendizado */}
              <Route path="/learning" element={<ProtectedRoutes><LearningHome /></ProtectedRoutes>} />
              <Route path="/learning/modules/:moduleId" element={<ProtectedRoutes><LearningModule /></ProtectedRoutes>} />
              <Route path="/learning/topics/:topicId" element={<ProtectedRoutes><LearningTopic /></ProtectedRoutes>} />
              <Route path="/learning/completed/:topicId" element={<ProtectedRoutes><LearningCompleted /></ProtectedRoutes>} />
              <Route path="/learning/review/:topicId" element={<ProtectedRoutes><LearningReview /></ProtectedRoutes>} />
              <Route path="/learning/certificate" element={<ProtectedRoutes><LearningCertificate /></ProtectedRoutes>} />

              {/* Rotas de formação */}
              <Route path="/formation" element={<FormacaoProtectedRoutes><FormationHome /></FormacaoProtectedRoutes>} />
              <Route path="/formation/modules/:moduleId" element={<FormacaoProtectedRoutes><FormationModule /></FormacaoProtectedRoutes>} />
              <Route path="/formation/topics/:topicId" element={<FormacaoProtectedRoutes><FormationTopic /></FormacaoProtectedRoutes>} />
              <Route path="/formation/completed/:topicId" element={<FormacaoProtectedRoutes><FormationCompleted /></FormacaoProtectedRoutes>} />
              <Route path="/formation/review/:topicId" element={<FormacaoProtectedRoutes><FormationReview /></FormacaoProtectedRoutes>} />
              <Route path="/formation/certificate" element={<FormacaoProtectedRoutes><FormationCertificate /></FormacaoProtectedRoutes>} />

              {/* Rotas do fórum */}
              <Route path="/forum" element={<ProtectedRoutes><ForumHome /></ProtectedRoutes>} />
              <Route path="/forum/topics/:topicId" element={<ProtectedRoutes><ForumTopic /></ProtectedRoutes>} />
              <Route path="/forum/topics/create" element={<ProtectedRoutes><ForumCreateTopic /></ProtectedRoutes>} />
              <Route path="/forum/topics/:topicId/edit" element={<ProtectedRoutes><ForumEditTopic /></ProtectedRoutes>} />
              <Route path="/forum/posts/:postId" element={<ProtectedRoutes><ForumPost /></ProtectedRoutes>} />
              <Route path="/forum/posts/:postId/create" element={<ProtectedRoutes><ForumCreatePost /></ProtectedRoutes>} />
              <Route path="/forum/posts/:postId/edit" element={<ProtectedRoutes><ForumEditPost /></ProtectedRoutes>} />

              {/* Rotas de perfil */}
              <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
              <Route path="/profile/edit" element={<ProtectedRoutes><EditProfile /></ProtectedRoutes>} />
              <Route path="/profile/billing" element={<ProtectedRoutes><Billing /></ProtectedRoutes>} />
              <Route path="/profile/notifications" element={<ProtectedRoutes><Notifications /></ProtectedRoutes>} />
              <Route path="/profile/security" element={<ProtectedRoutes><Security /></ProtectedRoutes>} />
              <Route path="/profile/integrations" element={<ProtectedRoutes><Integrations /></ProtectedRoutes>} />
              <Route path="/profile/delete-account" element={<ProtectedRoutes><DeleteAccount /></ProtectedRoutes>} />
              
              {/* Rota 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            <Toaster 
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
            />
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
