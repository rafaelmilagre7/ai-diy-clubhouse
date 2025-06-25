
import { RouteObject } from "react-router-dom";
import { UnifiedProtectedRoutes } from '@/auth/UnifiedProtectedRoutes';
import FormacaoLayout from '@/components/layout/FormacaoLayout';

// Formacao pages
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCourses from '@/pages/formacao/FormacaoCourses';
import FormacaoStudents from '@/pages/formacao/FormacaoStudents';
import FormacaoReports from '@/pages/formacao/FormacaoReports';

// Função helper para criar rotas protegidas de formação
const createFormacaoRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <UnifiedProtectedRoutes requireFormacao><FormacaoLayout><Component /></FormacaoLayout></UnifiedProtectedRoutes>
});

export const formacaoRoutes: RouteObject[] = [
  createFormacaoRoute("/formacao", FormacaoDashboard),
  createFormacaoRoute("/formacao/dashboard", FormacaoDashboard),
  createFormacaoRoute("/formacao/courses", FormacaoCourses),
  createFormacaoRoute("/formacao/students", FormacaoStudents),
  createFormacaoRoute("/formacao/reports", FormacaoReports),
];
