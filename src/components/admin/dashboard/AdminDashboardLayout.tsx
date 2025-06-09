
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { DashboardCharts } from "./DashboardCharts";
import { RecentActivity } from "./RecentActivity";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TrendingUp, Users, Activity } from "lucide-react";

interface AdminDashboardLayoutProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  statsData: any;
  engagementData: any[];
  completionRateData: any[];
  recentActivities: any[];
  loading: boolean;
}

export const AdminDashboardLayout = ({
  timeRange,
  setTimeRange,
  statsData,
  engagementData,
  completionRateData,
  recentActivities,
  loading
}: AdminDashboardLayoutProps) => {
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Dashboard Administrativo"
          description="Carregando dados da plataforma..."
        />
        
        <Card variant="elevated" className="p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <Text variant="subsection" textColor="primary" className="font-semibold">
                Processando Analytics
              </Text>
              <Text variant="body" textColor="secondary">
                Aguarde enquanto coletamos os dados mais recentes
              </Text>
            </div>
            
            <LoadingSpinner 
              variant="accent" 
              size="lg" 
              text="Carregando dashboard..." 
              icon="activity"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
        
        <div className="relative z-10">
          <PageHeader
            title="Dashboard Administrativo"
            description="Visão geral completa da plataforma e métricas de desempenho em tempo real"
          />
        </div>
      </div>

      <div className="space-y-8">
        <DashboardHeader 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        <div className="space-y-8">
          <StatsOverview data={statsData} loading={false} />
          
          <div className="grid gap-8 lg:grid-cols-2">
            <Card variant="elevated" className="overflow-hidden">
              <div className="p-6 border-b border-border-subtle bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Text variant="card" textColor="primary" className="font-semibold">
                      Análise de Engajamento
                    </Text>
                    <Text variant="caption" textColor="secondary">
                      Tendências de uso da plataforma
                    </Text>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <DashboardCharts 
                  engagementData={engagementData} 
                  completionRateData={completionRateData}
                  loading={false}
                />
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="overflow-hidden">
              <div className="p-6 border-b border-border-subtle bg-gradient-to-r from-accent/5 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <Text variant="card" textColor="primary" className="font-semibold">
                      Atividade Recente
                    </Text>
                    <Text variant="caption" textColor="secondary">
                      Últimas ações dos usuários
                    </Text>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <RecentActivity activities={recentActivities} loading={false} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
