import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { CommentStats } from "@/hooks/admin/useCommentStats";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentStatsCardsProps {
  stats: CommentStats;
  isLoading: boolean;
}

export const CommentStatsCards: React.FC<CommentStatsCardsProps> = ({
  stats,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total de Comentários",
      value: stats.total_comments,
      description: "Comentários recebidos",
      icon: MessageSquare,
      color: "text-status-info",
      bgColor: "bg-status-info-lighter"
    },
    {
      title: "Comentários Respondidos",
      value: stats.replied_comments,
      description: "Já foram respondidos",
      icon: CheckCircle,
      color: "text-system-healthy",
      bgColor: "bg-system-healthy/10"
    },
    {
      title: "Comentários Pendentes",
      value: stats.pending_comments,
      description: "Aguardando resposta",
      icon: Clock,
      color: "text-status-warning",
      bgColor: "bg-status-warning-lighter"
    },
    {
      title: "Taxa de Resposta",
      value: `${stats.reply_rate}%`,
      description: "Percentual respondido",
      icon: TrendingUp,
      color: stats.reply_rate >= 80 ? "text-system-healthy" : stats.reply_rate >= 60 ? "text-status-warning" : "text-status-error",
      bgColor: stats.reply_rate >= 80 ? "bg-system-healthy/10" : stats.reply_rate >= 60 ? "bg-status-warning-lighter" : "bg-status-error-lighter"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
            
            {/* Badge adicional para taxa de resposta */}
            {card.title === "Taxa de Resposta" && (
              <Badge
                variant={stats.reply_rate >= 80 ? "default" : "secondary"}
                className="mt-2"
              >
                {stats.reply_rate >= 80 ? "Excelente" : 
                 stats.reply_rate >= 60 ? "Boa" : "Precisa melhorar"}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};