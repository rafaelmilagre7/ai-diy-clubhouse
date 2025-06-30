
import React, { useState, useCallback } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { RealAnalyticsOverview } from '@/components/admin/analytics/RealAnalyticsOverview';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/tabs/UserAnalyticsTabContent';
import { SolutionAnalyticsTabContent } from '@/components/admin/analytics/tabs/SolutionAnalyticsTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/tabs/LmsAnalyticsTabContent';
import { ModernAnalyticsHeader } from '@/components/admin/analytics/ModernAnalyticsHeader';
import { AdvancedFilterBar } from '@/components/admin/analytics/AdvancedFilterBar';
import { ModernTabsNavigation } from '@/components/admin/analytics/ModernTabsNavigation';
import { OptimizedAnalyticsProvider } from '@/components/admin/analytics/providers/OptimizedAnalyticsProvider';
import { TabTransition } from '@/components/admin/analytics/components/TransitionWrapper';
import { useRealAdminAnalytics } from '@/hooks/admin/useRealAdminAnalytics';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const { toast } = useToast();
  
  // Usar o hook de analytics real
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refresh: refreshAnalytics 
  } = useRealAdminAnalytics(timeRange);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handleRefresh = useCallback(() => {
    toast({
      title: "Atualizando dados",
      description: "Os dados estão sendo atualizados...",
    });
    refreshAnalytics();
  }, [refreshAnalytics, toast]);

  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "O relatório será preparado em breve...",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Configurações",
      description: "Funcionalidade em desenvolvimento...",
    });
  };

  // Preparar dados para os componentes
  const tabsData = {
    totalUsers: analyticsData?.totalUsers || 0,
    totalSolutions: analyticsData?.totalSolutions || 0,
    totalCourses: analyticsData?.totalCourses || 0,
    activeImplementations: analyticsData?.activeImplementations || 0
  };

  return (
    <PermissionGuard 
      permission="analytics.view"
      fallback={
        <Alert variant="destructive" className="max-w-4xl mx-auto my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar os dados de analytics.
            Entre em contato com um administrador se precisar de acesso a este recurso.
          </AlertDescription>
        </Alert>
      }
    >
      <OptimizedAnalyticsProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Modern Header */}
            <ModernAnalyticsHeader
              lastUpdated={new Date()}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onSettings={handleSettings}
              isLoading={analyticsLoading}
              totalUsers={tabsData.totalUsers}
              totalSolutions={tabsData.totalSolutions}
              totalCourses={tabsData.totalCourses}
            />

            {/* Advanced Filters */}
            <AdvancedFilterBar
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              category={category}
              onCategoryChange={setCategory}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
            />

            {/* Modern Tabs Navigation */}
            <ModernTabsNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabsData={tabsData}
            />

            {/* Tab Contents with Transitions */}
            <TabTransition tabKey={activeTab} className="mt-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <RealAnalyticsOverview 
                    data={analyticsData}
                    loading={analyticsLoading} 
                    error={analyticsError}
                  />
                </div>
              )}
              
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <UserAnalyticsTabContent timeRange={timeRange} />
                </div>
              )}
              
              {activeTab === 'solutions' && (
                <div className="space-y-4">
                  <SolutionAnalyticsTabContent timeRange={timeRange} />
                </div>
              )}
              
              {activeTab === 'learning' && (
                <div className="space-y-4">
                  <LmsAnalyticsTabContent timeRange={timeRange} />
                </div>
              )}
            </TabTransition>
          </div>
        </div>
      </OptimizedAnalyticsProvider>
    </PermissionGuard>
  );
};

export default AdminAnalytics;
