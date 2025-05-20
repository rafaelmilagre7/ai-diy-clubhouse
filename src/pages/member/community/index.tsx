
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CommunityHome from './CommunityHome';
import TopicView from './TopicView';
import NewTopic from './NewTopic';
import CategoryView from './CategoryView';
import { Helmet } from 'react-helmet';

export default function CommunityPages() {
  return (
    <>
      <Helmet>
        <title>Comunidade | VDA Academy</title>
      </Helmet>
      <Routes>
        <Route index element={<CommunityHome />} />
        <Route path="topico/:topicId" element={<TopicView />} />
        <Route path="novo-topico/:categorySlug" element={<NewTopic />} />
        <Route path="categoria/:categorySlug" element={<CategoryView />} />
      </Routes>
    </>
  );
}
