
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/member/Dashboard";
import Profile from "@/pages/member/Profile";
import SolutionDetails from "@/pages/member/SolutionDetails";
import NotFound from "@/pages/NotFound";
import MemberLearning from "@/pages/member/learning/MemberLearning";
import CourseDetails from "@/pages/member/learning/CourseDetails";
import LessonView from "@/pages/member/learning/LessonView";
import MemberCertificates from "@/pages/member/learning/MemberCertificates";
import ValidateCertificate from "@/pages/certificate/ValidateCertificate";

const MemberRoutes = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isFormacaoRoute = window.location.pathname.startsWith('/formacao');

  // Redirecionar para /login se for rota de admin ou formação e usuário não tiver permissão
  if (isAdminRoute || isFormacaoRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Rotas principais */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/solutions/:id" element={<SolutionDetails />} />
      
      {/* Rotas de aprendizado melhoradas */}
      <Route path="/learning" element={<MemberLearning />} />
      <Route path="/learning/course/:id" element={<CourseDetails />} />
      <Route path="/learning/course/:courseId/lesson/:lessonId" element={<LessonView />} />
      <Route path="/certificates" element={<MemberCertificates />} />
      
      {/* Rota pública de validação de certificados */}
      <Route path="/certificado/validar/:code?" element={<ValidateCertificate />} />
      
      {/* Rota curinga para formacao (redireciona para login) */}
      <Route path="/formacao/*" element={<Navigate to="/login" replace />} />
      
      {/* Rota para lidar com páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MemberRoutes;
