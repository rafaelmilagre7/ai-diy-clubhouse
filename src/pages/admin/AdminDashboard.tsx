
import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/useRealAdminDashboardData";
import { RealAdminDashboardLayout } from "@/components/admin/dashboard/RealAdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { logger } from "@/utils/logger";
import { AdminPermissionsDiagnostic } from "@/components/admin/AdminPermissionsDiagnostic";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  try {
    const {
      statsData,
      activityData,
      loading,
      refetch
    } = useRealAdminDashboardData(timeRange);

    // Loading state otimizado
    if (loading) {
      logger.debug('AdminDashboard loading state', { timeRange });
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      );
    }

    // Calcular totalEvents a partir das propriedades disponíveis
    const totalEvents = (activityData?.totalLogins || 0) + 
                       (activityData?.forumActivity || 0) + 
                       (activityData?.completedSolutions || 0) + 
                       (activityData?.activeImplementations || 0);

    logger.info('AdminDashboard data loaded successfully', {
      timeRange,
      hasStatsData: !!statsData,
      totalUsers: statsData?.totalUsers || 0,
      totalEvents,
      activitiesCount: activityData?.recentActivities?.length || 0
    });

    return (
      <div className="space-y-6">
        {/* Diagnóstico de Permissões */}
        <AdminPermissionsDiagnostic />
        
        <RealAdminDashboardLayout
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          statsData={statsData}
          activityData={activityData}
          loading={loading}
        />
      </div>
    );
  } catch (error) {
    logger.error("Erro crítico no AdminDashboard", { 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      component: 'ADMIN_DASHBOARD' 
    });
    
    const handleRetry = () => {
      // Force re-render by reloading component state
      setTimeRange(prev => prev);
    };
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Temporariamente Indisponível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ocorreu um erro ao carregar o dashboard. Tente novamente em alguns instantes.
            </p>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default AdminDashboard;
