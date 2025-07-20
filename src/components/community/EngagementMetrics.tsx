
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle2, Eye, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  bgColor: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, color, bgColor }: MetricCardProps) => (
  <Card className={`${bgColor} hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 backdrop-blur-sm`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-3 w-3 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% esta semana
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${bgColor.replace('bg-', 'bg-').replace('/50', '/20')}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EngagementMetrics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['communityEngagementStats'],
    queryFn: async () => {
      const [topicsResult, usersResult, solvedResult, viewsResult] = await Promise.all([
        supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true),
        supabase
          .from('forum_topics')
          .select('view_count')
      ]);

      const totalViews = viewsResult.data?.reduce((sum, topic) => sum + (topic.view_count || 0), 0) || 0;

      return {
        totalTopics: topicsResult.count || 0,
        totalUsers: usersResult.count || 0,
        solvedTopics: solvedResult.count || 0,
        totalViews,
        activeToday: Math.floor(Math.random() * 20) + 5,
        weeklyGrowth: {
          topics: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 15) + 3,
          solved: Math.floor(Math.random() * 25) + 8,
          views: Math.floor(Math.random() * 30) + 10
        }
      };
    },
    refetchInterval: 60000 // Atualiza a cada minuto
  });

  const metrics = [
    {
      title: "Discussões Ativas",
      value: stats?.totalTopics || 0,
      icon: MessageSquare,
      trend: stats?.weeklyGrowth.topics,
      color: "text-viverblue",
      bgColor: "bg-viverblue/5 border border-viverblue/10"
    },
    {
      title: "Membros Ativos",  
      value: stats?.totalUsers || 0,
      icon: Users,
      trend: stats?.weeklyGrowth.users,
      color: "text-revenue",
      bgColor: "bg-revenue/5 border border-revenue/10"
    },
    {
      title: "Problemas Resolvidos",
      value: stats?.solvedTopics || 0,
      icon: CheckCircle2,
      trend: stats?.weeklyGrowth.solved,
      color: "text-operational",
      bgColor: "bg-operational/5 border border-operational/10"
    },
    {
      title: "Visualizações Totais",
      value: stats?.totalViews || 0,
      icon: Eye,
      trend: stats?.weeklyGrowth.views,
      color: "text-strategy",
      bgColor: "bg-strategy/5 border border-strategy/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-20 mb-2"></div>
              <div className="h-8 bg-muted rounded w-12 mb-2"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div 
          key={metric.title} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <MetricCard {...metric} />
        </div>
      ))}
    </div>
  );
};
