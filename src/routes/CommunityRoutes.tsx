
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityHome from '@/pages/member/community/CommunityHome';
import CategoryView from '@/pages/member/community/CategoryView';
import NewTopic from '@/pages/member/community/NewTopic';

export const CommunityRoutes = () => {
  return (
    <Routes>
      <Route index element={<CommunityHome />} />
      <Route path="categoria/:slug" element={<CategoryView />} />
      <Route path="novo-topico/:categorySlug" element={<NewTopic />} />
    </Routes>
  );
};

export default CommunityRoutes;
