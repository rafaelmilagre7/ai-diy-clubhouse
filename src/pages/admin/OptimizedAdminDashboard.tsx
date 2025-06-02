
import { useState } from "react";
import { useOptimizedAdminDashboardData } from "@/hooks/admin/useOptimizedAdminDashboardData";
import { AdminDashboardLayout } from "@/components/admin/dashboard/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard administrativo otimizado
 */
const OptimizedAdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  const {
    statsData,
    engagementData,
    completionRateData,
    recentActivities,
    loading
  } = useOptimizedAdminDashboardData(timeRange);

  // Loading state otimizado
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Fallback para erro
  if (!statsData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Temporariamente Indisponível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O dashboard está sendo carregado. Tente novamente em alguns instantes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminDashboardLayout
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      statsData={statsData}
      engagementData={engagementData || []}
      completionRateData={completionRateData || []}
      recentActivities={recentActivities}
      loading={loading}
    />
  );
};

export default OptimizedAdminDashboard;
