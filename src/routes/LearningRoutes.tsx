
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

export const LearningRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <LearningPage />
        </MemberLayout>
      } />
      
      <Route path="course/:id" element={
        <MemberLayout>
          <CourseDetails />
        </MemberLayout>
      } />
      
      <Route path="course/:courseId/lesson/:lessonId" element={
        <MemberLayout>
          <LessonView />
        </MemberLayout>
      } />
    </Routes>
  );
};
