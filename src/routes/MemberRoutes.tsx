
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import RootRedirect from '@/components/routing/RootRedirect';
import Layout from '@/components/layout/Layout';

// Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SolutionDetailsPage from '@/pages/solutions/SolutionDetailsPage';
import LearningPage from '@/pages/learning/LearningPage';
import LearningCoursePage from '@/pages/learning/LearningCoursePage';
import LearningLessonPage from '@/pages/learning/LearningLessonPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import NetworkingPage from '@/pages/networking/NetworkingPage';
import CommunityPage from '@/pages/community/CommunityPage';
import CommunityTopicPage from '@/pages/community/CommunityTopicPage';
import EventsPage from '@/pages/events/EventsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import ToolsPage from '@/pages/tools/ToolsPage';

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
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/solutions/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <SolutionDetailsPage />
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
          <LearningCoursePage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning/lesson/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <LearningLessonPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/networking",
    element: (
      <ProtectedRoute>
        <Layout>
          <NetworkingPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/community",
    element: (
      <ProtectedRoute>
        <Layout>
          <CommunityPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/topic/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <CommunityTopicPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <Layout>
          <EventsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Layout>
          <ProfilePage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tools",
    element: (
      <ProtectedRoute>
        <Layout>
          <ToolsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
];
