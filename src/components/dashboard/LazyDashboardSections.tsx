
import { lazy } from 'react';

// Lazy loading de seções pesadas do dashboard
export const LazyActiveSolutions = lazy(() => 
  import('./ActiveSolutions').then(module => ({ default: module.ActiveSolutions }))
);

export const LazyCompletedSolutions = lazy(() => 
  import('./CompletedSolutions').then(module => ({ default: module.CompletedSolutions }))
);

export const LazyRecommendedSolutions = lazy(() => 
  import('./RecommendedSolutions').then(module => ({ default: module.RecommendedSolutions }))
);

export const LazyImplementationTrailCard = lazy(() => 
  import('./ImplementationTrailCard').then(module => ({ default: module.ImplementationTrailCard }))
);
