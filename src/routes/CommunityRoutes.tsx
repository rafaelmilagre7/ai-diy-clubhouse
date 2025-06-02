
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

// Lazy load community pages
const CommunityHome = React.lazy(() => import('@/pages/member/community/CommunityHome'));
const CategoryView = React.lazy(() => import('@/pages/member/community/CategoryView'));
const TopicView = React.lazy(() => import('@/pages/member/community/TopicView'));
const NewTopic = React.lazy(() => import('@/pages/member/community/NewTopic'));

export const CommunityRoutes = () => {
  return (
    <SmartFeatureGuard feature="community">
      <Routes>
        <Route index element={<CommunityHome />} />
        <Route path="categoria/:slug" element={<CategoryView />} />
        <Route path="topico/:topicId" element={<TopicView />} />
        <Route path="novo-topico/:categorySlug" element={<NewTopic />} />
      </Routes>
    </SmartFeatureGuard>
  );
};

export default CommunityRoutes;
