
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Páginas da comunidade
const CommunityOverview = lazy(() => import('./Overview'));
const ForumPage = lazy(() => import('./Forum'));
const CategoryPage = lazy(() => import('./Category'));
const TopicPage = lazy(() => import('./Topic'));
const NewTopicPage = lazy(() => import('./NewTopic'));
const MembersPage = lazy(() => import('./Members'));
const MemberProfilePage = lazy(() => import('./MemberProfile'));
const ConnectionManagementPage = lazy(() => import('./ConnectionManagement'));

// Componente de loading
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

const CommunityPages = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<CommunityOverview />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
        <Route path="/topico/:topicId" element={<TopicPage />} />
        <Route path="/novo-topico/:categorySlug" element={<NewTopicPage />} />
        <Route path="/membros" element={<MembersPage />} />
        <Route path="/membro/:memberId" element={<MemberProfilePage />} />
        <Route path="/conexoes" element={<ConnectionManagementPage />} />
        <Route path="*" element={<Navigate to="/comunidade/forum" replace />} />
      </Routes>
    </Suspense>
  );
};

export default CommunityPages;
