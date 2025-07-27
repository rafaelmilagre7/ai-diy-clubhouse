import { lazy, Suspense } from 'react';
import { OptimizedErrorBoundary } from '@/components/common/OptimizedErrorBoundary';
import { devLog } from '@/hooks/useOptimizedLogging';

// Loading Fallback otimizado
const RouteFallback = ({ routeName }: { routeName: string }) => {
  devLog(`[LAZY-ROUTE] Carregando ${routeName}...`);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Carregando {routeName}...</p>
      </div>
    </div>
  );
};

// Wrapper para lazy components com error boundary
const withLazyLoading = (importFn: () => Promise<any>, routeName: string) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <OptimizedErrorBoundary>
      <Suspense fallback={<RouteFallback routeName={routeName} />}>
        <LazyComponent {...props} />
      </Suspense>
    </OptimizedErrorBoundary>
  );
};

// Lazy Routes - Admin
export const LazyAdminDashboard = withLazyLoading(
  () => import('@/pages/admin/AdminDashboard'),
  'Painel Admin'
);

export const LazyAdminUsers = withLazyLoading(
  () => import('@/pages/admin/AdminUsers'),
  'Usuários Admin'
);

export const LazyAdminAnalytics = withLazyLoading(
  () => import('@/pages/admin/AdminAnalytics'),
  'Analytics Admin'
);

export const LazyAdminTools = withLazyLoading(
  () => import('@/pages/admin/AdminTools'),
  'Ferramentas Admin'
);

export const LazyAdminSuggestions = withLazyLoading(
  () => import('@/pages/admin/AdminSuggestions'),
  'Sugestões Admin'
);

export const LazyAdminCommunications = withLazyLoading(
  () => import('@/pages/admin/AdminCommunications'),
  'Comunicações Admin'
);

export const LazyAdminRoles = withLazyLoading(
  () => import('@/pages/admin/AdminRoles'),
  'Roles Admin'
);

export const LazyAdminSettings = withLazyLoading(
  () => import('@/pages/admin/AdminSettings'),
  'Configurações Admin'
);

// Lazy Routes - Principais
export const LazyCommunityHome = withLazyLoading(
  () => import('@/pages/CommunityHome'),
  'Comunidade'
);

// Lazy Routes - Learning
export const LazyLearningLesson = withLazyLoading(
  () => import('@/pages/member/learning/LessonView'),
  'Aula'
);

// Removido rota que não existe

// Lazy Routes - Member
export const LazyBenefits = withLazyLoading(
  () => import('@/pages/member/Benefits'),
  'Benefícios'
);

export const LazyAchievements = withLazyLoading(
  () => import('@/pages/member/Achievements'),
  'Conquistas'
);

export const LazyNetworking = withLazyLoading(
  () => import('@/pages/member/Networking'),
  'Networking'
);

export const LazyProfile = withLazyLoading(
  () => import('@/pages/member/ProfilePage'),
  'Perfil'
);

// Lazy Routes - Formação
export const LazyFormacaoAulas = withLazyLoading(
  () => import('@/pages/formacao/FormacaoAulas'),
  'Aulas Formação'
);

export const LazyFormacaoCursos = withLazyLoading(
  () => import('@/pages/formacao/FormacaoCursos'),
  'Cursos Formação'
);