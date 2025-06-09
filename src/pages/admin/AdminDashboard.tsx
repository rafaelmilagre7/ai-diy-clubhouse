
import { useState } from "react";
import { useAdminDashboardData } from "@/hooks/admin/useAdminDashboardData";
import { AdminDashboardLayout } from "@/components/admin/dashboard/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/utils/logger";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  try {
    const {
      statsData,
      engagementData,
      completionRateData,
      recentActivities,
      loading
    } = useAdminDashboardData(timeRange);

    // Fallback para quando os dados não estão disponíveis
    if (loading) {
      logger.debug('AdminDashboard loading state', { timeRange });
      
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

    logger.info('AdminDashboard data loaded successfully', {
      timeRange,
      hasStatsData: !!statsData,
      engagementDataLength: engagementData?.length || 0,
      completionDataLength: completionRateData?.length || 0,
      activitiesCount: recentActivities?.length || 0
    });

    return (
      <AdminDashboardLayout
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        statsData={statsData || {}}
        engagementData={engagementData || []}
        completionRateData={completionRateData || []}
        recentActivities={recentActivities || []}
        loading={loading}
      />
    );
  } catch (error) {
    logger.error("Erro crítico no AdminDashboard", { 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      component: 'ADMIN_DASHBOARD' 
    });
    
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
};

export default AdminDashboard;
