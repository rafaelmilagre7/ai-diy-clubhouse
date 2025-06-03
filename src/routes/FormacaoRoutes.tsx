
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Importar componentes lazy
import {
  LazyFormacaoDashboardWithSuspense,
  LazyFormacaoCursosWithSuspense,
  LazyFormacaoCursoDetalhesWithSuspense,
  LazyFormacaoModuloDetalhesWithSuspense,
  LazyFormacaoAulasWithSuspense,
  LazyFormacaoAulaDetalhesWithSuspense,
  LazyFormacaoAulaEditarWithSuspense
} from '@/components/routing/LazyRoutes';

export const FormacaoRoutes = () => {
  return (
    <FormacaoProtectedRoutes>
      <FormacaoLayout>
        <Suspense fallback={<LoadingScreen message="Carregando área de formação..." />}>
          <Routes>
            <Route index element={<LazyFormacaoDashboardWithSuspense />} />
            <Route path="cursos" element={<LazyFormacaoCursosWithSuspense />} />
            <Route path="curso/:id" element={<LazyFormacaoCursoDetalhesWithSuspense />} />
            <Route path="cursos/:id" element={<LazyFormacaoCursoDetalhesWithSuspense />} />
            <Route path="modulos/:id" element={<LazyFormacaoModuloDetalhesWithSuspense />} />
            <Route path="aulas" element={<LazyFormacaoAulasWithSuspense />} />
            <Route path="aulas/:id" element={<LazyFormacaoAulaDetalhesWithSuspense />} />
            <Route path="aulas/:id/editar" element={<LazyFormacaoAulaEditarWithSuspense />} />
            <Route path="materiais" element={<div>Página de Materiais</div>} />
            <Route path="alunos" element={<div>Página de Alunos</div>} />
            <Route path="configuracoes" element={<div>Configurações do LMS</div>} />
          </Routes>
        </Suspense>
      </FormacaoLayout>
    </FormacaoProtectedRoutes>
  );
};
