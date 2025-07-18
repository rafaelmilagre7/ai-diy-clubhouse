
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Formação Pages - usando páginas administrativas existentes como base
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminSolutions from '@/pages/admin/AdminSolutions';

export const formacaoRoutes = [
  {
    path: "/formacao",
    element: (
      <ProtectedRoute requireFormacao={true}>
        <FormacaoLayout>
          <FormacaoDashboard />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/members",
    element: (
      <ProtectedRoute requireFormacao={true}>
        <FormacaoLayout>
          <AdminRoles />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/events",
    element: (
      <ProtectedRoute requireFormacao={true}>
        <FormacaoLayout>
          <AdminEvents />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/content",
    element: (
      <ProtectedRoute requireFormacao={true}>
        <FormacaoLayout>
          <AdminSolutions />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
];
