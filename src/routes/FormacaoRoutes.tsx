
import { RouteObject } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';
import OptimizedLoadingScreen from '@/components/common/OptimizedLoadingScreen';

// Lazy loading de páginas de formação para melhor performance
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const FormacaoCursos = lazy(() => import('@/pages/formacao/FormacaoCursos'));
const FormacaoCursoDetalhes = lazy(() => import('@/pages/formacao/FormacaoCursoDetalhes'));
const FormacaoModuloDetalhes = lazy(() => import('@/pages/formacao/FormacaoModuloDetalhes'));
const FormacaoAulas = lazy(() => import('@/pages/formacao/FormacaoAulas'));
const FormacaoAulaDetalhes = lazy(() => import('@/pages/formacao/FormacaoAulaDetalhes'));
const FormacaoAulaEditar = lazy(() => import('@/pages/formacao/FormacaoAulaEditar'));
const FormacaoMateriais = lazy(() => import('@/pages/formacao/FormacaoMateriais'));
const FormacaoTagsGestao = lazy(() => import('@/pages/formacao/FormacaoTagsGestao'));
const FormacaoComentarios = lazy(() => import('@/pages/formacao/FormacaoComentarios'));
const FormacaoCertificados = lazy(() => import('@/pages/formacao/FormacaoCertificados'));

const wrapFormacaoRoute = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <FormacaoProtectedRoutes>
    <FormacaoLayout>
      <Suspense fallback={<OptimizedLoadingScreen />}>
        <Component />
      </Suspense>
    </FormacaoLayout>
  </FormacaoProtectedRoutes>
);

export const formacaoRoutes: RouteObject[] = [
  { path: "/formacao", element: wrapFormacaoRoute(FormacaoDashboard) },
  { path: "/formacao/cursos", element: wrapFormacaoRoute(FormacaoCursos) },
  { path: "/formacao/cursos/:id", element: wrapFormacaoRoute(FormacaoCursoDetalhes) },
  { path: "/formacao/modulos/:id", element: wrapFormacaoRoute(FormacaoModuloDetalhes) },
  { path: "/formacao/aulas", element: wrapFormacaoRoute(FormacaoAulas) },
  { path: "/formacao/aulas/:id/editar", element: wrapFormacaoRoute(FormacaoAulaEditar) },
  { path: "/formacao/aulas/:id", element: wrapFormacaoRoute(FormacaoAulaDetalhes) },
  { 
    path: "/formacao/tags", 
    element: (
      <FormacaoProtectedRoutes>
        <Suspense fallback={<OptimizedLoadingScreen />}>
          <FormacaoTagsGestao />
        </Suspense>
      </FormacaoProtectedRoutes>
    )
  },
  { path: "/formacao/comentarios", element: wrapFormacaoRoute(FormacaoComentarios) },
  { path: "/formacao/materiais", element: wrapFormacaoRoute(FormacaoMateriais) },
  { path: "/formacao/certificados", element: wrapFormacaoRoute(FormacaoCertificados) },
];
