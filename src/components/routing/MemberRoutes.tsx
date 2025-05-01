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
import FormacaoCertificateTemplates from "@/pages/formacao/FormacaoCertificateTemplates";

const MemberRoutes = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isFormacaoRoute = window.location.pathname.startsWith('/formacao');

  // Redirecionar para /admin se for rota de admin e usuário não for admin
  if (isAdminRoute) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar para /formacao se for rota de formacao e usuário não for formacao
  if (isFormacaoRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Rotas principais */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/solutions/:id" element={<SolutionDetails />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Rotas de aprendizado */}
      <Route path="/cursos" element={<MemberLearning />} />
      <Route path="/cursos/:slug" element={<CourseDetails />} />
      <Route path="/aulas/:id" element={<LessonView />} />
      <Route path="/certificados" element={<MemberCertificates />} />
      
      {/* Rota pública de validação de certificados */}
      <Route path="/certificado/validar/:code?" element={<ValidateCertificate />} />
      
      {/* Rotas de formação */}
      <Route path="/formacao">
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="certificados" element={<FormacaoCertificateTemplates />} />
      </Route>
      
      {/* Rota curinga para formacao (redireciona para not found) */}
      <Route path="/formacao/*" element={<NotFound />} />
    </Routes>
  );
};

export default MemberRoutes;
