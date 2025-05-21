
import { Routes, Route } from "react-router-dom";
import ForumHome from "./ForumHome";
import CategoryView from "./CategoryView";
import TopicView from "./TopicView";
import NewTopicPage from "./NewTopicPage";
import { MembersDirectory } from "@/components/community/members/MembersDirectory";
import ConnectionManagement from "./ConnectionManagement";

const CommunityPages = () => {
  return (
    <Routes>
      <Route path="/" element={<ForumHome />} />
      <Route path="/categoria/:slug" element={<CategoryView />} />
      <Route path="/topico/:id" element={<TopicView />} />
      <Route path="/novo-topico/:categorySlug" element={<NewTopicPage />} />
      <Route path="/membros" element={<MembersDirectory />} />
      <Route path="/conexoes" element={<ConnectionManagement />} />
    </Routes>
  );
};

export default CommunityPages;
