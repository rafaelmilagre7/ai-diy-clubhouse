import React from "react";
import {
  LightBulbIcon,
  CheckIcon,
  PercentIcon,
} from "lucide-react";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ReferralWidget } from "@/components/referrals/ReferralWidget";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export const KpiGrid: React.FC = () => {
  const { solutions, progressData, loading, error } = useDashboardData();

  const activeSolutionsCount = solutions?.length || 0;
  const completedSolutionsCount = progressData?.filter((item) => item.is_completed).length || 0;
  const completionRate = activeSolutionsCount > 0
    ? Math.round((completedSolutionsCount / activeSolutionsCount) * 100)
    : 0;

  const render = () => {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <KpiCard
          title="Soluções Ativas"
          value={activeSolutionsCount}
          icon={<LightBulbIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Soluções Concluídas"
          value={completedSolutionsCount}
          icon={<CheckIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={<PercentIcon className="h-4 w-4 text-muted-foreground" />}
        />
        
        {/* Widget de indicações */}
        <div className="lg:col-span-3">
          <ReferralWidget />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando KPIs...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Erro ao carregar KPIs: {error}</div>;
  }

  return render();
};
