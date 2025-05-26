
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoutes';
import { MemberLayout } from '@/components/layout/MemberLayout';
import Dashboard from '@/pages/member/Dashboard';
import SolutionDetail from '@/pages/member/SolutionDetail';
import ImplementationPage from '@/pages/member/ImplementationPage';
import { ProfilePage } from '@/pages/member/ProfilePage';
import CommunityPages from '@/pages/member/community';
import LearningPages from '@/pages/member/learning';
import ConnectionsPage from '@/pages/member/community/ConnectionsPage';
import MessagesPage from '@/pages/member/community/MessagesPage';
import NotificationsPage from '@/pages/member/community/NotificationsPage';
import NewTopicPage from '@/pages/member/community/NewTopicPage';
import CategoryTopics from '@/pages/member/community/CategoryTopics';
import TopicDetailPage from '@/pages/member/community/TopicDetailPage';

export const memberRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <Dashboard />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/solution/:id",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <SolutionDetail />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/solution/:id/implement",
    element: (
      <ProtectedRoute>
        <ImplementationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <ProfilePage />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/comunidade/*",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <CommunityPages />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/comunidade/novo-topico",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <NewTopicPage />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/comunidade/topico/:topicId",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <TopicDetailPage />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/comunidade/categoria/:categorySlug",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <CategoryTopics />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning/*",
    element: (
      <ProtectedRoute>
        <MemberLayout>
          <LearningPages />
        </MemberLayout>
      </ProtectedRoute>
    ),
  },
];
