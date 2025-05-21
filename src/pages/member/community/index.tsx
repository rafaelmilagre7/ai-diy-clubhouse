
import { Route, Routes } from 'react-router-dom';
import CommunityHome from './CommunityHome';
import CategoryTopics from './CategoryTopics';
import TopicDetail from './TopicDetail';
import CommunityMembers from './CommunityMembers';

const CommunityPages = () => {
  return (
    <Routes>
      <Route path="/" element={<CommunityHome />} />
      <Route path="/categoria/:categorySlug" element={<CategoryTopics />} />
      <Route path="/topico/:topicId" element={<TopicDetail />} />
      <Route path="/membros" element={<CommunityMembers />} />
      <Route path="*" element={<CommunityHome />} />
    </Routes>
  );
};

export default CommunityPages;
