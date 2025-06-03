
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import LearningPage from "@/pages/member/learning/LearningPage";

// Lazy imports para performance
import { lazy } from "react";

const CourseDetails = lazy(() => import("@/pages/member/learning/CourseDetails"));
const LessonView = lazy(() => import("@/pages/member/learning/LessonView"));

const LearningRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando área de aprendizado..." />}>
      <Routes>
        <Route index element={<LearningPage />} />
        <Route path="course/:id" element={<CourseDetails />} />
        <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
      </Routes>
    </Suspense>
  );
};

export default LearningRoutes;
