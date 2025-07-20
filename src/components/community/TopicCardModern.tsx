
import React from "react";
import { Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock, Clock, TrendingUp } from "lucide-react";
import { Topic } from "@/types/forumTypes";
import { getInitials } from "@/utils/user";
import { getContentPreview } from "./utils/contentUtils";

interface TopicCardModernProps {
  topic: Topic;
  showPreview?: boolean;
  compact?: boolean;
}

export const TopicCardModern = ({ topic, showPreview = true, compact = false }: TopicCardModernProps) => {
  const getRelativeTime = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const getEngagementLevel = () => {
    const totalEngagement = (topic.view_count || 0) + (topic.reply_count || 0) * 5;
    if (totalEngagement > 50) return 'high';
    if (totalEngagement > 20) return 'medium';
    return 'low';
  };

  const engagementLevel = getEngagementLevel();
  const engagementColors = {
    high: 'border-l-operational',
    medium: 'border-l-revenue', 
    low: 'border-l-muted'
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-l-4 ${engagementColors[engagementLevel]} bg-card/80 backdrop-blur-sm`}>
      <Link to={`/comunidade/topico/${topic.id}`} className="block">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Avatar com status */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                  <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-viverblue to-revenue text-white font-semibold">
                    {getInitials(topic.profiles?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Indicador de atividade online - simulado */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">
              {/* Header com meta info */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-medium text-foreground hover:text-viverblue transition-colors">
                  {topic.profiles?.name || "Usuário"}
                </span>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{getRelativeTime(topic.created_at)}</span>
                </div>

                {topic.category && (
                  <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/20 hover:bg-viverblue/20 transition-colors">
                    {topic.category.icon && <span className="mr-1">{topic.category.icon}</span>}
                    {topic.category.name}
                  </Badge>
                )}

                {/* Badges de status */}
                <div className="flex gap-1">
                  {topic.is_pinned && (
                    <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 border-blue-200">
                      <Pin className="h-3 w-3" />
                      Fixado
                    </Badge>
                  )}
                  
                  {topic.is_locked && (
                    <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700 border-red-200">
                      <Lock className="h-3 w-3" />
                      Travado
                    </Badge>
                  )}
                  
                  {topic.is_solved && (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-200">
                      <ThumbsUp className="h-3 w-3" />
                      Resolvido
                    </Badge>
                  )}
                </div>
              </div>

              {/* Título */}
              <h3 className="text-lg font-semibold text-foreground group-hover:text-viverblue transition-colors mb-2 line-clamp-2">
                {topic.title}
              </h3>

              {/* Preview do conteúdo */}
              {showPreview && !compact && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                  {getContentPreview(topic.content)}
                </p>
              )}

              {/* Métricas de engajamento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 hover:text-viverblue transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>{topic.reply_count || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 hover:text-revenue transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>{topic.view_count || 0}</span>
                  </div>

                  {engagementLevel === 'high' && (
                    <div className="flex items-center gap-1 text-operational">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">Em alta</span>
                    </div>
                  )}
                </div>

                {/* Última atividade */}
                {topic.last_activity_at && new Date(topic.last_activity_at).getTime() !== new Date(topic.created_at).getTime() && (
                  <div className="text-xs text-muted-foreground">
                    Última atividade {getRelativeTime(topic.last_activity_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
