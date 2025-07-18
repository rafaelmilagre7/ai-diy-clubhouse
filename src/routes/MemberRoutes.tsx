
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import RootRedirect from '@/components/routing/RootRedirect';
import Layout from '@/components/layout/Layout';

// Pages - corrigindo imports para os arquivos corretos
import Dashboard from '@/pages/member/Dashboard';
import SolutionDetails from '@/pages/member/SolutionDetails';
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
import OnboardingNewPage from '@/pages/member/OnboardingNew';
import Networking from '@/pages/member/Networking';
import ForumHome from '@/pages/member/forum/ForumHome';
import CategoryView from '@/pages/member/forum/CategoryView';
import Events from '@/pages/member/Events';
import Profile from '@/pages/member/Profile';
import Tools from '@/pages/member/Tools';

export const memberRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/solutions/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <SolutionDetails />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning",
    element: (
      <ProtectedRoute>
        <Layout>
          <LearningPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning/course/:slug",
    element: (
      <ProtectedRoute>
        <Layout>
          <CourseDetails />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning/lesson/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <LessonView />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingNewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/networking",
    element: (
      <ProtectedRoute>
        <Layout>
          <Networking />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/community",
    element: (
      <ProtectedRoute>
        <Layout>
          <ForumHome />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/topic/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <CategoryView />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <Layout>
          <Events />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tools",
    element: (
      <ProtectedRoute>
        <Layout>
          <Tools />
        </Layout>
      </ProtectedRoute>
    ),
  },
];
