
import { Route } from "react-router-dom";
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

export const FormacaoRoutes = () => {
  return (
    <>
      {/* Formação Routes with Layout */}
      <Route path="/formacao" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoDashboard /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/cursos" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursos /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/cursos/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursoDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/modulos/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoModuloDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulas /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      {/* Nova rota para edição de aulas */}
      <Route path="/formacao/aulas/:id/editar" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaEditar /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/materiais" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Página de Materiais</div></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/alunos" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Página de Alunos</div></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/configuracoes" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Configurações do LMS</div></FormacaoLayout></FormacaoProtectedRoutes>} />
    </>
  );
};
