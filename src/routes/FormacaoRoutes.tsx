
import { RouteObject } from "react-router-dom";
import FormacaoRoute from '@/components/routing/FormacaoRoute';
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
    element: <FormacaoRoute><FormacaoLayout><FormacaoDashboard /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/cursos",
    element: <FormacaoRoute><FormacaoLayout><FormacaoCursos /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/cursos/:id",
    element: <FormacaoRoute><FormacaoLayout><FormacaoCursoDetalhes /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/modulos/:id",
    element: <FormacaoRoute><FormacaoLayout><FormacaoModuloDetalhes /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/aulas",
    element: <FormacaoRoute><FormacaoLayout><FormacaoAulas /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/aulas/:id",
    element: <FormacaoRoute><FormacaoLayout><FormacaoAulaDetalhes /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/aulas/:id/editar",
    element: <FormacaoRoute><FormacaoLayout><FormacaoAulaEditar /></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/materiais",
    element: <FormacaoRoute><FormacaoLayout><div>Página de Materiais</div></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/alunos",
    element: <FormacaoRoute><FormacaoLayout><div>Página de Alunos</div></FormacaoLayout></FormacaoRoute>
  },
  {
    path: "/formacao/configuracoes",
    element: <FormacaoRoute><FormacaoLayout><div>Configurações do LMS</div></FormacaoLayout></FormacaoRoute>
  },
];
