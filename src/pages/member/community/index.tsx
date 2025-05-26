
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ForumPage from './ForumPage';
import TopicDetailsPage from './TopicDetailsPage';
import MembersPage from './MembersPage';
import ConnectionsPage from './ConnectionsPage';
import MessagesPage from './MessagesPage';
import MemberDetailsPage from './MemberDetailsPage';

const CommunityPages = () => {
  return (
    <Routes>
      <Route index element={<ForumPage />} />
      <Route path="topico/:id" element={<TopicDetailsPage />} />
      <Route path="membros" element={<MembersPage />} />
      <Route path="membro/:id" element={<MemberDetailsPage />} />
      <Route path="conexoes" element={<ConnectionsPage />} />
      <Route path="mensagens" element={<MessagesPage />} />
    </Routes>
  );
};

export default CommunityPages;
