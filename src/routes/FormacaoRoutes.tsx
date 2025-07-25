
import { RouteObject } from "react-router-dom";
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Formação (Admin LMS)
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoCursoDetalhes from '@/pages/formacao/FormacaoCursoDetalhes';
import FormacaoModuloDetalhes from '@/pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulas from '@/pages/formacao/FormacaoAulas';
import FormacaoAulaDetalhes from '@/pages/formacao/FormacaoAulaDetalhes';
import FormacaoAulaEditar from '@/pages/formacao/FormacaoAulaEditar';
import FormacaoMateriais from '@/pages/formacao/FormacaoMateriais';
import FormacaoConfiguracoes from '@/pages/formacao/FormacaoConfiguracoes';

export const formacaoRoutes: RouteObject[] = [
  {
    path: "/formacao",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoDashboard /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/cursos",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursos /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/cursos/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursoDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/modulos/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoModuloDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulas /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas/:id",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/aulas/:id/editar",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaEditar /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/materiais",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoMateriais /></FormacaoLayout></FormacaoProtectedRoutes>
  },
  {
    path: "/formacao/configuracoes",
    element: <FormacaoProtectedRoutes><FormacaoLayout><FormacaoConfiguracoes /></FormacaoLayout></FormacaoProtectedRoutes>
  },
];
