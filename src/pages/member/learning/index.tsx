
import { Routes, Route } from 'react-router-dom';
import LearningPage from './LearningPage';
import CourseDetails from './CourseDetails';
import LessonView from './LessonView';
import MemberCertificates from './MemberCertificates';
import MemberLearning from './MemberLearning';

const LearningPages = () => {
  return (
    <Routes>
      <Route index element={<MemberLearning />} />
      <Route path="cursos" element={<LearningPage />} />
      <Route path="curso/:id" element={<CourseDetails />} />
      <Route path="curso/:courseId/aula/:lessonId" element={<LessonView />} />
      <Route path="certificados" element={<MemberCertificates />} />
    </Routes>
  );
};

export default LearningPages;
