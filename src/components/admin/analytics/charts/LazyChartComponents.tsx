
import React, { Suspense, memo } from 'react';
import { useLazyComponent } from '@/hooks/performance/useLazyComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Skeleton para gráficos
const ChartSkeleton = memo(({ title, height = "300px" }: { title?: string; height?: string }) => (
  <Card>
    {title && (
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <Skeleton className="w-full" style={{ height }} />
    </CardContent>
  </Card>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Lazy loading para EnhancedAreaChart
export const LazyEnhancedAreaChart = memo((props: any) => {
  const LazyComponent = useLazyComponent(
    () => import('./EnhancedAreaChart').then(mod => ({ default: mod.EnhancedAreaChart })),
    { preload: true }
  );

  return (
    <Suspense fallback={<ChartSkeleton title={props.title} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
});

LazyEnhancedAreaChart.displayName = 'LazyEnhancedAreaChart';

// Lazy loading para EnhancedBarChart
export const LazyEnhancedBarChart = memo((props: any) => {
  const LazyComponent = useLazyComponent(
    () => import('./EnhancedBarChart').then(mod => ({ default: mod.EnhancedBarChart })),
    { preload: true }
  );

  return (
    <Suspense fallback={<ChartSkeleton title={props.title} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
});

LazyEnhancedBarChart.displayName = 'LazyEnhancedBarChart';

// Lazy loading para EnhancedPieChart
export const LazyEnhancedPieChart = memo((props: any) => {
  const LazyComponent = useLazyComponent(
    () => import('./EnhancedPieChart').then(mod => ({ default: mod.EnhancedPieChart })),
    { preload: true }
  );

  return (
    <Suspense fallback={<ChartSkeleton title={props.title} height="350px" />}>
      <LazyComponent {...props} />
    </Suspense>
  );
});

LazyEnhancedPieChart.displayName = 'LazyEnhancedPieChart';

// Wrapper para preload de gráficos
export const PreloadCharts = memo(() => {
  // Preload todos os componentes de gráfico em idle time
  React.useEffect(() => {
    const preloadTimer = setTimeout(() => {
      import('./EnhancedAreaChart');
      import('./EnhancedBarChart');
      import('./EnhancedPieChart');
    }, 1000);

    return () => clearTimeout(preloadTimer);
  }, []);

  return null;
});

PreloadCharts.displayName = 'PreloadCharts';
