
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Formação Pages
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoMemberManager from '@/pages/formacao/FormacaoMemberManager';
import FormacaoEventManager from '@/pages/formacao/FormacaoEventManager';
import FormacaoContentManager from '@/pages/formacao/FormacaoContentManager';

export const formacaoRoutes = [
  {
    path: "/formacao",
    element: (
      <ProtectedRoute requiredRole="formacao">
        <FormacaoLayout>
          <FormacaoDashboard />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/members",
    element: (
      <ProtectedRoute requiredRole="formacao">
        <FormacaoLayout>
          <FormacaoMemberManager />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/events",
    element: (
      <ProtectedRoute requiredRole="formacao">
        <FormacaoLayout>
          <FormacaoEventManager />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/formacao/content",
    element: (
      <ProtectedRoute requiredRole="formacao">
        <FormacaoLayout>
          <FormacaoContentManager />
        </FormacaoLayout>
      </ProtectedRoute>
    ),
  },
];
