
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActivityFeed = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['forum-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          reply_count,
          user_id,
          profiles!inner(name),
          forum_categories(name, color)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics?.map((topic) => (
            <div key={topic.id} className="border-b pb-4 last:border-b-0">
              <Link 
                to={`/comunidade/topico/${topic.id}`}
                className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                     <AvatarFallback>
                       {Array.isArray(topic.profiles) && topic.profiles[0]?.name?.charAt(0) || 
                        (topic.profiles as any)?.name?.charAt(0) || '?'}
                     </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {topic.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {topic.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {topic.view_count || 0}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {topic.reply_count || 0}
                      </span>
                    </div>
                    
                     {topic.forum_categories && (
                       <Badge 
                         variant="outline" 
                         className="mt-2 text-xs"
                         style={{ 
                           borderColor: Array.isArray(topic.forum_categories) 
                             ? topic.forum_categories[0]?.color 
                             : (topic.forum_categories as any)?.color 
                         }}
                       >
                         {Array.isArray(topic.forum_categories) 
                           ? topic.forum_categories[0]?.name 
                           : (topic.forum_categories as any)?.name}
                       </Badge>
                     )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          {!topics?.length && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente encontrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
