
import { useState } from "react";
import { useAdminDashboardData } from "@/hooks/admin/useAdminDashboardData";
import { AdminDashboardLayout } from "@/components/admin/dashboard/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Container size="6xl" padding="lg" className="py-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} variant="elevated" className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} variant="elevated">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-48 mb-4" />
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
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
      <Container size="6xl" padding="lg" className="py-8">
        <AdminDashboardLayout
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          statsData={statsData || {}}
          engagementData={engagementData || []}
          completionRateData={completionRateData || []}
          recentActivities={recentActivities || []}
          loading={loading}
        />
      </Container>
    );
  } catch (error) {
    logger.error("Erro crítico no AdminDashboard", error, 'ADMIN_DASHBOARD');
    
    return (
      <Container size="6xl" padding="lg" className="py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card variant="outline" className="max-w-md mx-auto text-center">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-error/10 rounded-2xl">
                  <AlertCircle className="h-12 w-12 text-error" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Text variant="subsection" textColor="primary">
                  Dashboard Temporariamente Indisponível
                </Text>
                <Text variant="body" textColor="secondary">
                  O dashboard está sendo carregado. Tente novamente em alguns instantes.
                </Text>
              </div>
              
              <Button onClick={() => window.location.reload()} className="hover-scale">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
};

export default AdminDashboard;
