
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import { lazy } from 'react';

// Lazy load das páginas principais - usando apenas páginas que existem
const OptimizedDashboard = lazy(() => import('@/pages/member/OptimizedDashboard'));
const NetworkingPage = lazy(() => import('@/pages/member/networking/NetworkingPage'));
const LearningPage = lazy(() => import('@/pages/member/learning/LearningPage'));
const CourseDetailsWithAccess = lazy(() => import('@/pages/member/learning/CourseDetailsWithAccess'));
const ImplementationTrailPage = lazy(() => import('@/pages/member/ImplementationTrailPage'));

// Função helper para criar rotas protegidas com MemberLayout
const createMemberRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><MemberLayout><Component /></MemberLayout></ProtectedRoutes>
});

export const memberRoutes: RouteObject[] = [
  createMemberRoute("/", OptimizedDashboard),
  createMemberRoute("/dashboard", OptimizedDashboard),
  
  // Networking - mantendo apenas a página principal que existe
  createMemberRoute("/networking", NetworkingPage),
  
  // Learning - usando o novo componente com verificação de acesso
  createMemberRoute("/learning", LearningPage),
  createMemberRoute("/learning/courses/:id", CourseDetailsWithAccess),
  
  // Trilha de Implementação
  createMemberRoute("/implementation-trail", ImplementationTrailPage),
];
