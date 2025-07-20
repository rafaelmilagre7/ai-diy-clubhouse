
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Eye, MessageSquare, Flame } from "lucide-react";
import { Link } from "react-router-dom";

interface TrendingTopic {
  id: string;
  title: string;
  view_count: number;
  reply_count: number;
  category_name?: string;
  engagement_score: number;
}

export const TrendingWidget = () => {
  const { data: trendingTopics, isLoading } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          view_count,
          reply_count,
          forum_categories:category_id(name)
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Calcular engagement score
      return data?.map(topic => ({
        id: topic.id,
        title: topic.title,
        view_count: topic.view_count || 0,
        reply_count: topic.reply_count || 0,
        category_name: topic.forum_categories?.name,
        engagement_score: (topic.view_count || 0) + (topic.reply_count || 0) * 5
      }))
      .filter(topic => topic.engagement_score > 0)
      .sort((a, b) => b.engagement_score - a.engagement_score) || [];
    },
    refetchInterval: 60000 // Atualiza a cada minuto
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-muted rounded w-12"></div>
                <div className="h-5 bg-muted rounded w-12"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trendingTopics?.length) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Em Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Ainda não há tópicos em alta
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Em Alta
          <Badge variant="secondary" className="ml-auto">
            {trendingTopics.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <Link
            key={topic.id}
            to={`/comunidade/topico/${topic.id}`}
            className="block group hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Ranking */}
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-viverblue transition-colors mb-2">
                  {topic.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{topic.view_count}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{topic.reply_count}</span>
                  </div>

                  <div className="flex items-center gap-1 text-orange-500">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-medium">{topic.engagement_score}</span>
                  </div>
                </div>

                {topic.category_name && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {topic.category_name}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
