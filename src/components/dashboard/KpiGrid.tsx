
import React from "react";
import {
  Lightbulb,
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

interface KpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
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

export const KpiGrid: React.FC<KpiGridProps> = ({ 
  completed, 
  inProgress, 
  total, 
  isLoading = false 
}) => {
  // Calcule a taxa de conclusão
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-gray-200 animate-pulse rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <KpiCard
        title="Soluções Ativas"
        value={inProgress}
        icon={<Lightbulb className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        title="Soluções Concluídas"
        value={completed}
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
