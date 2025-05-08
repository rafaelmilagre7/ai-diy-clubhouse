
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Importações lazy para otimizar carregamento
const Dashboard = lazy(() => import("@/pages/member/Dashboard"));
const LearningHome = lazy(() => import("@/pages/member/learning/LearningHome"));
const CourseView = lazy(() => import("@/pages/member/learning/CourseView"));
const LessonView = lazy(() => import("@/pages/member/learning/LessonView"));
const MyCertificates = lazy(() => import("@/pages/member/learning/MyCertificates"));

export const memberRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/learning",
    children: [
      { index: true, element: <LearningHome /> },
      { path: "course/:courseId", element: <CourseView /> },
      { path: "course/:courseId/lesson/:lessonId", element: <LessonView /> },
      { path: "certificates", element: <MyCertificates /> }
    ]
  }
];

export default memberRoutes;
