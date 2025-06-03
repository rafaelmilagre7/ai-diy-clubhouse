
import { RouteObject } from "react-router-dom";
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

export const formacaoRoutes: RouteObject[] = [
  {
    path: "/formacao",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoDashboardWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/cursos",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoCursosWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/cursos/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoCursoDetalhesWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/modulos/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoModuloDetalhesWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoAulasWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoAulaDetalhesWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas/:id/editar",
    element: <FormacaoProtectedRoutes><FormacaoLayout><LazyFormacaoAulaEditarWithSuspense /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/materiais",
    element: <FormacaoProtectedRoutes><FormacaoLayout><div>Página de Materiais</div></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/alunos",
    element: <FormacaoProtectedRoutes><FormacaoLayout><div>Página de Alunos</div></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/configuracoes",
    element: <FormacaoProtectedRoutes><FormacaoLayout><div>Configurações do LMS</div></FormacaoLayout></FormacaoProtectedRoutes>
  },
];
