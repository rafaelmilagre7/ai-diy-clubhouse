
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Users, Award, TrendingUp } from "lucide-react";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  type: 'new_topic' | 'new_reply' | 'topic_solved' | 'new_member';
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  topic_title?: string;
  topic_id?: string;
}

export const ActivityFeed = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['communityActivity'],
    queryFn: async () => {
      // Busca atividades recentes - tópicos e posts
      const [topicsResult, postsResult] = await Promise.all([
        supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            created_at,
            is_solved,
            profiles:user_id(name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('forum_posts') 
          .select(`
            id,
            created_at,
            profiles:user_id(name, avatar_url),
            forum_topics:topic_id(id, title)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: Activity[] = [];

      // Adicionar novos tópicos
      topicsResult.data?.forEach(topic => {
        activities.push({
          id: `topic-${topic.id}`,
          type: topic.is_solved ? 'topic_solved' : 'new_topic',
          user_name: (topic.profiles as any)?.name || 'Usuário',
          user_avatar: (topic.profiles as any)?.avatar_url,
          content: topic.title,
          created_at: topic.created_at,
          topic_title: topic.title,
          topic_id: topic.id
        });
      });

      // Adicionar novas respostas
      postsResult.data?.forEach(post => {
        activities.push({
          id: `post-${post.id}`,
          type: 'new_reply',
          user_name: (post.profiles as any)?.name || 'Usuário',
          user_avatar: (post.profiles as any)?.avatar_url,
          content: `Respondeu em "${(post.forum_topics as any)?.title}"`,
          created_at: post.created_at,
          topic_title: (post.forum_topics as any)?.title,
          topic_id: (post.forum_topics as any)?.id
        });
      });

      // Ordenar por data
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'new_topic':
        return <MessageSquare className="h-4 w-4 text-viverblue" />;
      case 'new_reply':
        return <MessageSquare className="h-4 w-4 text-revenue" />;
      case 'topic_solved':
        return <Award className="h-4 w-4 text-operational" />;
      case 'new_member':
        return <Users className="h-4 w-4 text-strategy" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'new_topic':
        return 'criou um novo tópico';
      case 'new_reply':
        return 'respondeu';
      case 'topic_solved':
        return 'resolveu o tópico';
      case 'new_member':
        return 'entrou na comunidade';
      default:
        return 'teve uma atividade';
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-viverblue" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities?.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhuma atividade recente
          </p>
        ) : (
          activities?.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 group">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={activity.user_avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-viverblue/20 to-revenue/20 text-xs">
                  {getInitials(activity.user_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm font-medium text-foreground">
                    {activity.user_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getActivityText(activity)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                  {activity.content}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(activity.created_at), new Date(), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
