
import { useState } from "react";
import { useRealAdminDashboardData } from "@/hooks/admin/useRealAdminDashboardData";
import { RealAdminDashboardLayout } from "@/components/admin/dashboard/RealAdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import LoadingScreen from "@/components/common/LoadingScreen";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  try {
    const {
      statsData,
      activityData,
      loading
    } = useRealAdminDashboardData(timeRange);

    // Loading state otimizado usando LoadingScreen consolidado
    if (loading) {
      logger.debug('AdminDashboard loading state', { timeRange });
      
      return (
        <LoadingScreen
          message="Carregando dashboard administrativo"
          variant="modern"
          type="full"
          fullScreen={false}
        />
      );
    }

    logger.info('AdminDashboard data loaded successfully', {
      timeRange,
      hasStatsData: !!statsData,
      totalUsers: statsData?.totalUsers || 0,
      totalEvents: activityData?.totalEvents || 0,
      activitiesCount: activityData?.userActivities?.length || 0
    });

    return (
      <RealAdminDashboardLayout
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        statsData={statsData}
        activityData={activityData}
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
              Ocorreu um erro ao carregar o dashboard. Tente novamente em alguns instantes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default AdminDashboard;
