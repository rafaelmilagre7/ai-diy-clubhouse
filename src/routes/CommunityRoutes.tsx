
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityHome from '@/pages/member/community/CommunityHome';
import TopicDetails from '@/pages/member/community/TopicDetails';
import CategoryTopics from '@/pages/member/community/CategoryTopics';
import CreateTopic from '@/pages/member/community/CreateTopic';

export const CommunityRoutes = () => {
  return (
    <Routes>
      <Route index element={<CommunityHome />} />
      <Route path="categoria/:slug" element={<CategoryTopics />} />
      <Route path="topico/:topicId" element={<TopicDetails />} />
      <Route path="novo-topico/:categorySlug" element={<CreateTopic />} />
    </Routes>
  );
};

export default CommunityRoutes;
