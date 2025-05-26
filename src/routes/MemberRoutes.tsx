
import { Route } from 'react-router-dom';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import Dashboard from '@/pages/member/Dashboard';
import Profile from '@/pages/member/Profile';
import CommunityPages from '@/pages/member/community';
import LearningPages from '@/pages/member/learning/index';
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
      <ProtectedRoutes>
        <MemberLayout>
          <Dashboard />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <Profile />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/comunidade/*",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <CommunityPages />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/comunidade/novo-topico",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <NewTopicPage />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/comunidade/topico/:topicId",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <TopicDetailPage />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/comunidade/categoria/:categorySlug",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <CategoryTopics />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
  {
    path: "/learning/*",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <LearningPages />
        </MemberLayout>
      </ProtectedRoutes>
    ),
  },
];
