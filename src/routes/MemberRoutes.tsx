
import { Route } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import Benefits from '@/pages/member/Benefits';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import Events from '@/pages/member/Events';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Member Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

export const MemberRoutes = () => {
  return (
    <>
      {/* Member Routes with Layout */}
      <Route path="/" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/dashboard" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation-trail" element={<ProtectedRoutes><MemberLayout><ImplementationTrailPage /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solutions" element={<ProtectedRoutes><MemberLayout><Solutions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools" element={<ProtectedRoutes><MemberLayout><Tools /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools/:id" element={<ProtectedRoutes><MemberLayout><ToolDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile" element={<ProtectedRoutes><MemberLayout><Profile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile/edit" element={<ProtectedRoutes><MemberLayout><EditProfile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solution/:id" element={<ProtectedRoutes><MemberLayout><SolutionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implement/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/completed/:id" element={<ProtectedRoutes><MemberLayout><ImplementationCompleted /></MemberLayout></ProtectedRoutes>} />
      <Route path="/benefits" element={<ProtectedRoutes><MemberLayout><Benefits /></MemberLayout></ProtectedRoutes>} />
      <Route path="/events" element={<ProtectedRoutes><MemberLayout><Events /></MemberLayout></ProtectedRoutes>} />
      
      {/* Learning/LMS Routes para membro */}
      <Route path="/learning" element={<ProtectedRoutes><MemberLayout><LearningPage /></MemberLayout></ProtectedRoutes>} />
      <Route path="/learning/course/:id" element={<ProtectedRoutes><MemberLayout><CourseDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/learning/course/:courseId/lesson/:lessonId" element={<ProtectedRoutes><MemberLayout><LessonView /></MemberLayout></ProtectedRoutes>} />
      
      {/* Sugestões Routes */}
      <Route path="/suggestions" element={<ProtectedRoutes><MemberLayout><Suggestions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/:id" element={<ProtectedRoutes><MemberLayout><SuggestionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/new" element={<ProtectedRoutes><MemberLayout><NewSuggestion /></MemberLayout></ProtectedRoutes>} />
    </>
  );
};
