
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy imports das páginas de comunidade que devem existir
import { lazy } from "react";

const CommunityPage = lazy(() => import("@/pages/member/community/CommunityPage"));
const TopicDetails = lazy(() => import("@/pages/member/community/TopicDetails"));
const CategoryTopics = lazy(() => import("@/pages/member/community/CategoryTopics"));
const NewTopic = lazy(() => import("@/pages/member/community/NewTopic"));

const CommunityRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando comunidade..." />}>
      <Routes>
        <Route index element={<CommunityPage />} />
        <Route path="categoria/:slug" element={<CategoryTopics />} />
        <Route path="topico/:topicId" element={<TopicDetails />} />
        <Route path="novo-topico/:categorySlug" element={<NewTopic />} />
      </Routes>
    </Suspense>
  );
};

export default CommunityRoutes;
