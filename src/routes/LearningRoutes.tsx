
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

export const LearningRoutes = () => {
  return (
    <Routes>
      {/* Página principal de cursos */}
      <Route index element={<LearningPage />} />
      
      {/* Detalhes de um curso específico */}
      <Route path="course/:id" element={<CourseDetails />} />
      
      {/* Visualização de uma aula específica */}
      <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
    </Routes>
  );
};
