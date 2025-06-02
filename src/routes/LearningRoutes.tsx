
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

// Lazy load learning pages
const LearningPage = React.lazy(() => import('@/pages/member/learning/LearningPage'));
const CourseDetails = React.lazy(() => import('@/pages/member/learning/CourseDetails'));
const LessonView = React.lazy(() => import('@/pages/member/learning/LessonView'));

export const LearningRoutes = () => {
  return (
    <SmartFeatureGuard feature="learning">
      <Routes>
        <Route index element={<LearningPage />} />
        <Route path="course/:id" element={<CourseDetails />} />
        <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
      </Routes>
    </SmartFeatureGuard>
  );
};

export default LearningRoutes;
