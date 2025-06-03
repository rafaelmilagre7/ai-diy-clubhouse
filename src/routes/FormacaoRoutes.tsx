
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Lazy imports
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const FormacaoCursos = lazy(() => import('@/pages/formacao/FormacaoCursos'));
const FormacaoCursoDetalhes = lazy(() => import('@/pages/formacao/FormacaoCursoDetalhes'));
const FormacaoModuloDetalhes = lazy(() => import('@/pages/formacao/FormacaoModuloDetalhes'));
const FormacaoAulas = lazy(() => import('@/pages/formacao/FormacaoAulas'));
const FormacaoAulaDetalhes = lazy(() => import('@/pages/formacao/FormacaoAulaDetalhes'));
const FormacaoAulaEditar = lazy(() => import('@/pages/formacao/FormacaoAulaEditar'));

export const FormacaoRoutes = () => {
  return (
    <FormacaoProtectedRoutes>
      <FormacaoLayout>
        <Suspense fallback={<LoadingScreen message="Carregando área de formação..." />}>
          <Routes>
            <Route index element={<FormacaoDashboard />} />
            <Route path="cursos" element={<FormacaoCursos />} />
            <Route path="curso/:id" element={<FormacaoCursoDetalhes />} />
            <Route path="cursos/:id" element={<FormacaoCursoDetalhes />} />
            <Route path="modulos/:id" element={<FormacaoModuloDetalhes />} />
            <Route path="aulas" element={<FormacaoAulas />} />
            <Route path="aulas/:id" element={<FormacaoAulaDetalhes />} />
            <Route path="aulas/:id/editar" element={<FormacaoAulaEditar />} />
            <Route path="materiais" element={<div>Página de Materiais</div>} />
            <Route path="alunos" element={<div>Página de Alunos</div>} />
            <Route path="configuracoes" element={<div>Configurações do LMS</div>} />
          </Routes>
        </Suspense>
      </FormacaoLayout>
    </FormacaoProtectedRoutes>
  );
};
