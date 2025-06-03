
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy imports para performance
import {
  LazyLearningPageWithSuspense,
  LazyCourseDetailsWithSuspense,
  LazyLessonViewWithSuspense
} from "@/components/routing/LazyRoutes";

export const LearningRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando área de aprendizado..." />}>
      <Routes>
        <Route index element={<LazyLearningPageWithSuspense />} />
        <Route path="course/:id" element={<LazyCourseDetailsWithSuspense />} />
        <Route path="course/:courseId/lesson/:lessonId" element={<LazyLessonViewWithSuspense />} />
      </Routes>
    </Suspense>
  );
};
