
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
export const LazyCategoryViewWithSuspense = withSuspense(LazyNewTopic);
export const LazyNewTopicWithSuspense = withSuspense(LazyNewTopic);

export const LazyNetworkingPageWithSuspense = withSuspense(LazyNetworkingPage);
