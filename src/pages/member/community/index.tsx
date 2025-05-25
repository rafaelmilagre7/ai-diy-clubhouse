
import { Routes, Route } from 'react-router-dom';
import CommunityPage from './CommunityPage';
import TopicView from './TopicView';
import NewTopic from './NewTopic';
import Category from './Category';
import CommunityMembers from './CommunityMembers';
import ConnectionsPage from './ConnectionsPage';

const CommunityPages = () => {
  return (
    <Routes>
      <Route index element={<CommunityPage />} />
      <Route path="topico/:id" element={<TopicView />} />
      <Route path="novo-topico" element={<NewTopic />} />
      <Route path="novo-topico/:categorySlug" element={<NewTopic />} />
      <Route path="categoria/:categorySlug" element={<Category />} />
      <Route path="membros" element={<CommunityMembers />} />
      <Route path="conexoes" element={<ConnectionsPage />} />
    </Routes>
  );
};

export default CommunityPages;
