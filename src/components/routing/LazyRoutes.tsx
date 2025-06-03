
import React, { Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading para páginas menos críticas
const LazyEvents = React.lazy(() => import('@/pages/member/Events'));
const LazyBenefits = React.lazy(() => import('@/pages/member/Benefits'));
const LazySuggestions = React.lazy(() => import('@/pages/member/Suggestions'));
const LazySuggestionDetails = React.lazy(() => import('@/pages/member/SuggestionDetails'));
const LazyNewSuggestion = React.lazy(() => import('@/pages/member/NewSuggestion'));

// Lazy loading para páginas de learning
const LazyLearningPage = React.lazy(() => import('@/pages/member/learning/LearningPage'));
const LazyCourseDetails = React.lazy(() => import('@/pages/member/learning/CourseDetails'));
const LazyLessonView = React.lazy(() => import('@/pages/member/learning/LessonView'));

// Lazy loading para páginas de comunidade
const LazyCommunityHome = React.lazy(() => import('@/pages/member/community/CommunityHome'));
const LazyTopicView = React.lazy(() => import('@/pages/member/community/TopicView'));
const LazyCategoryView = React.lazy(() => import('@/pages/member/community/CategoryView'));
const LazyNewTopic = React.lazy(() => import('@/pages/member/community/NewTopic'));

// Lazy loading para networking
const LazyNetworkingPage = React.lazy(() => import('@/pages/member/networking/NetworkingPage'));

// NOVO: Lazy loading para área de formação
const LazyFormacaoDashboard = React.lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const LazyFormacaoCursos = React.lazy(() => import('@/pages/formacao/FormacaoCursos'));
const LazyFormacaoCursoDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoCursoDetalhes'));
const LazyFormacaoModuloDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoModuloDetalhes'));
const LazyFormacaoAulas = React.lazy(() => import('@/pages/formacao/FormacaoAulas'));
const LazyFormacaoAulaDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoAulaDetalhes'));
const LazyFormacaoAulaEditar = React.lazy(() => import('@/pages/formacao/FormacaoAulaEditar'));

// HOC para adicionar Suspense automaticamente
const withSuspense = (Component: React.ComponentType) => {
  return (props: any) => (
    <Suspense fallback={<LoadingScreen message="Carregando página..." />}>
      <Component {...props} />
    </Suspense>
  );
};

// Exportar componentes lazy com Suspense
export const LazyEventsWithSuspense = withSuspense(LazyEvents);
export const LazyBenefitsWithSuspense = withSuspense(LazyBenefits);
export const LazySuggestionsWithSuspense = withSuspense(LazySuggestions);
export const LazySuggestionDetailsWithSuspense = withSuspense(LazySuggestionDetails);
export const LazyNewSuggestionWithSuspense = withSuspense(LazyNewSuggestion);

export const LazyLearningPageWithSuspense = withSuspense(LazyLearningPage);
export const LazyCourseDetailsWithSuspense = withSuspense(LazyCourseDetails);
export const LazyLessonViewWithSuspense = withSuspense(LazyLessonView);

export const LazyCommunityHomeWithSuspense = withSuspense(LazyCommunityHome);
export const LazyTopicViewWithSuspense = withSuspense(LazyTopicView);
export const LazyCategoryViewWithSuspense = withSuspense(LazyCategoryView);
export const LazyNewTopicWithSuspense = withSuspense(LazyNewTopic);

export const LazyNetworkingPageWithSuspense = withSuspense(LazyNetworkingPage);

// NOVO: Componentes de formação com lazy loading
export const LazyFormacaoDashboardWithSuspense = withSuspense(LazyFormacaoDashboard);
export const LazyFormacaoCursosWithSuspense = withSuspense(LazyFormacaoCursos);
export const LazyFormacaoCursoDetalhesWithSuspense = withSuspense(LazyFormacaoCursoDetalhes);
export const LazyFormacaoModuloDetalhesWithSuspense = withSuspense(LazyFormacaoModuloDetalhes);
export const LazyFormacaoAulasWithSuspense = withSuspense(LazyFormacaoAulas);
export const LazyFormacaoAulaDetalhesWithSuspense = withSuspense(LazyFormacaoAulaDetalhes);
export const LazyFormacaoAulaEditarWithSuspense = withSuspense(LazyFormacaoAulaEditar);
