
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, Users, FileText } from "lucide-react";

interface ActivityData {
  type: string;
  count: number;
  period: string;
}

interface RealSystemActivityProps {
  activityData: ActivityData[];
  loading: boolean;
}

export const RealSystemActivity = ({ activityData, loading }: RealSystemActivityProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'novos usuários':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'implementações':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'usuários ativos':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente do Sistema</CardTitle>
        <CardDescription>
          Principais métricas de atividade da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityData.length > 0 ? (
          activityData.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Últimos {activity.period}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{activity.count.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade recente encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
