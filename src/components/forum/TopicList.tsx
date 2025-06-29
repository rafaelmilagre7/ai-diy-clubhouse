
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MessagesSquare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  last_post_at?: string;
  last_post_user?: {
    name: string;
    avatar_url: string;
  } | null;
}

interface TopicListProps {
  categoryId: string;
  categorySlug: string;
}

export const TopicList = ({ categoryId, categorySlug }: TopicListProps) => {
  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['forumTopics', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*, profiles:user_id(*)')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });
      
      if (error) throw error;
      return data as ForumTopic[];
    }
  });

  if (isLoading) {
    return <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-md animate-pulse">
          <div className="flex justify-between">
            <div className="h-6 bg-muted rounded-md w-1/3"></div>
            <div className="h-6 bg-muted rounded-md w-20"></div>
          </div>
          <div className="h-4 bg-muted rounded-md w-1/2 mt-2"></div>
        </div>
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-center py-10">
      <p className="text-red-500">Erro ao carregar tópicos.</p>
      <p className="text-sm text-muted-foreground mt-2">Por favor, tente novamente mais tarde.</p>
    </div>;
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tópicos</h2>
        <Button asChild>
          <Link to={`/forum/new-topic/${categorySlug}`}>
            <Plus className="h-4 w-4 mr-2" /> Novo Tópico
          </Link>
        </Button>
      </div>
      
      {topics && topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link 
              key={topic.id} 
              to={`/forum/topic/${topic.id}`} 
              className="block p-4 border rounded-md hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={topic.profiles?.avatar_url || undefined} alt={topic.profiles?.name || 'Usuário'} />
                    <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {topic.is_pinned && <span className="text-primary mr-1">📌</span>}
                      {topic.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Por {topic.profiles?.name || 'Usuário Anônimo'} • 
                      {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessagesSquare className="h-4 w-4 mr-1" /> 
                  {topic.reply_count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum tópico ainda</h3>
          <p className="text-muted-foreground mt-2 mb-6">Seja o primeiro a criar um novo tópico nesta categoria.</p>
          <Button asChild>
            <Link to={`/forum/new-topic/${categorySlug}`}>
              <Plus className="h-4 w-4 mr-2" /> Criar Tópico
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
