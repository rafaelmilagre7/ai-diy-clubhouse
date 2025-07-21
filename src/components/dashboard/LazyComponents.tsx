import { lazy, Suspense } from 'react';
import { SolutionsGridLoader } from './SolutionsGridLoader';

// Lazy loading de componentes pesados para melhor performance
export const LazyActiveSolutions = lazy(() => 
  import('./ActiveSolutions').then(module => ({ default: module.ActiveSolutions }))
);

export const LazyCompletedSolutions = lazy(() => 
  import('./CompletedSolutions').then(module => ({ default: module.CompletedSolutions }))
);

export const LazyRecommendedSolutions = lazy(() => 
  import('./RecommendedSolutions').then(module => ({ default: module.RecommendedSolutions }))
);

// Wrapper com Suspense para loading states fluidos
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  title: string;
  count?: number;
}

export const LazyComponentWrapper = ({ children, title, count = 3 }: LazyComponentWrapperProps) => (
  <Suspense fallback={<SolutionsGridLoader title={title} count={count} />}>
    {children}
  </Suspense>
);