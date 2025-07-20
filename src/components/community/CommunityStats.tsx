
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export const CommunityStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      const [topicsResult, usersResult, solvedResult] = await Promise.all([
        supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true)
      ]);

      return {
        totalTopics: topicsResult.count || 0,
        totalUsers: usersResult.count || 0,
        solvedTopics: solvedResult.count || 0,
        activeToday: Math.floor(Math.random() * 20) + 5 // Simulação - pode ser substituído por dados reais
      };
    }
  });

  const statCards = [
    {
      title: "Tópicos Totais",
      value: stats?.totalTopics || 0,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      title: "Membros Ativos",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      border: "border-green-200"
    },
    {
      title: "Tópicos Resolvidos",
      value: stats?.solvedTopics || 0,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      border: "border-purple-200"
    },
    {
      title: "Ativos Hoje",
      value: stats?.activeToday || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      border: "border-orange-200"
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
          <Card key={index} className={`${stat.border} ${stat.bgColor} hover:shadow-md transition-all duration-200`}>
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
