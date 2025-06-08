
import { EngagementChart } from "./EngagementChart";
import { CompletionRateChart } from "./CompletionRateChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TrendingUp, BarChart3 } from "lucide-react";

interface DashboardChartsProps {
  engagementData: { name: string; value: number }[];
  completionRateData: { name: string; completion: number }[];
  loading: boolean;
}

export const DashboardCharts = ({ engagementData, completionRateData, loading }: DashboardChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="elevated" className="overflow-hidden hover-lift">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Engajamento dos Usuários
              </CardTitle>
              <Text variant="body-small" textColor="secondary">
                Atividade e participação na plataforma
              </Text>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <EngagementChart data={engagementData} />
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden hover-lift">
        <CardHeader className="pb-4 bg-gradient-to-r from-success/5 to-info/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Taxa de Conclusão
              </CardTitle>
              <Text variant="body-small" textColor="secondary">
                Performance de finalização de projetos
              </Text>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CompletionRateChart data={completionRateData} />
        </CardContent>
      </Card>
    </div>
  );
};
