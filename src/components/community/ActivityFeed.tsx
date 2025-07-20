
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Eye, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: 'topic' | 'post';
  created_at: string;
  profiles?: Array<{
    name: string;
    avatar_url?: string;
  }>;
  forum_topics?: Array<{
    id: string;
    title: string;
  }>;
  title?: string;
  content?: string;
}

export const ActivityFeed = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['communityActivity'],
    queryFn: async () => {
      // Buscar tópicos recentes
      const { data: topics } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          profiles:user_id(name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar posts recentes
      const { data: posts } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id(name, avatar_url),
          forum_topics:topic_id(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combinar e ordenar atividades
      const allActivities: ActivityItem[] = [
        ...(topics?.map(topic => ({ ...topic, type: 'topic' as const })) || []),
        ...(posts?.map(post => ({ ...post, type: 'post' as const })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 8);

      return allActivities;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return <MessageSquare className="h-3 w-3" />;
      case 'post':
        return <Eye className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const userName = activity.profiles?.[0]?.name || 'Usuário';
    
    if (activity.type === 'topic') {
      return `${userName} criou um novo tópico`;
    } else {
      const topicTitle = activity.forum_topics?.[0]?.title || 'tópico';
      return `${userName} respondeu em "${topicTitle}"`;
    }
  };

  const getActivityLink = (activity: ActivityItem) => {
    if (activity.type === 'topic') {
      return `/comunidade/topico/${activity.id}`;
    } else {
      const topicId = activity.forum_topics?.[0]?.id;
      return topicId ? `/comunidade/topico/${topicId}` : '#';
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-viverblue" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities?.length ? (
          activities.map((activity) => (
            <Link
              key={activity.id}
              to={getActivityLink(activity)}
              className="block group hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.profiles?.[0]?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {activity.profiles?.[0]?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {getActivityIcon(activity.type)}
                      <span className="ml-1 capitalize">{activity.type === 'topic' ? 'Tópico' : 'Resposta'}</span>
                    </Badge>
                  </div>
                  
                  <p className="text-sm font-medium group-hover:text-viverblue transition-colors line-clamp-1">
                    {getActivityText(activity)}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhuma atividade recente
          </p>
        )}
      </CardContent>
    </Card>
  );
};
