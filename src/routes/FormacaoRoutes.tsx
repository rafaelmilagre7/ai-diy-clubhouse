
import { RouteObject } from "react-router-dom";
import { FormacaoProtectedRouteWithChildren } from '@/auth/FormacaoProtectedRouteWithChildren';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Formação (Admin LMS)
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoCursoDetalhes from '@/pages/formacao/FormacaoCursoDetalhes';
import FormacaoModuloDetalhes from '@/pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulas from '@/pages/formacao/FormacaoAulas';
import FormacaoAulaDetalhes from '@/pages/formacao/FormacaoAulaDetalhes';
import FormacaoAulaEditar from '@/pages/formacao/FormacaoAulaEditar';

export const formacaoRoutes: RouteObject[] = [
  {
    path: "/formacao",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoDashboard /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/cursos",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoCursos /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/cursos/:id",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoCursoDetalhes /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/modulos/:id",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoModuloDetalhes /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/aulas",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoAulas /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/aulas/:id",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoAulaDetalhes /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/aulas/:id/editar",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><FormacaoAulaEditar /></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/materiais",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><div>Página de Materiais</div></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/alunos",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><div>Página de Alunos</div></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
  {
    path: "/formacao/configuracoes",
    element: <FormacaoProtectedRouteWithChildren><FormacaoLayout><div>Configurações do LMS</div></FormacaoLayout></FormacaoProtectedRouteWithChildren>
  },
];
