
import { useCommunityStats } from "@/hooks/community/useCommunityStats";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export const CommunityStats = () => {
  const { topicCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();

  const statCards = [
    {
      title: "Tópicos Totais",
      value: topicCount,
      icon: MessageSquare,
      color: "text-operational",
      bgColor: "bg-operational/10",
      border: "border-operational/30"
    },
    {
      title: "Membros Ativos",
      value: activeUserCount,
      icon: Users,
      color: "text-operational",
      bgColor: "bg-operational/10",
      border: "border-operational/30"
    },
    {
      title: "Tópicos Resolvidos",
      value: solvedCount,
      icon: CheckCircle2,
      color: "text-strategy",
      bgColor: "bg-strategy/10",
      border: "border-strategy/30"
    },
    {
      title: "Ativos Hoje",
      value: Math.floor(Math.random() * 20) + 5, // Simulação
      icon: TrendingUp,
      color: "text-revenue",
      bgColor: "bg-revenue/10",
      border: "border-revenue/30"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-20 mb-2"></div>
              <div className="h-8 bg-muted rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.border} ${stat.bgColor} hover:shadow-md transition-all duration-base`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
