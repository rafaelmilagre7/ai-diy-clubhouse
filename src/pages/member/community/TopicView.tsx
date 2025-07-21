
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { PostList } from "@/components/community/PostList";
import { NewPostForm } from "@/components/community/NewPostForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MessageSquare, Eye, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface CommunityTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_activity_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string;
  } | null;
  community_categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['community-topic', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error('Topic ID is required');
      
      const { data, error } = await supabase
        .from('community_topics')
        .select(`
          *,
          profiles!community_topics_user_id_fkey(id, name, avatar_url),
          community_categories!community_topics_category_id_fkey(id, name, slug)
        `)
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      
      // Incrementar view count
      await supabase.rpc('increment_topic_views', { topic_id: topicId });
      
      return data as CommunityTopic;
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-1/3 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg mb-6">
            <div className="h-6 bg-muted rounded-md w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground mt-2 mb-6">O tópico que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to={topic.community_categories ? `/comunidade/categoria/${topic.community_categories.slug}` : "/comunidade"} className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para {topic.community_categories?.name || 'a Comunidade'}</span>
          </Link>
        </Button>
      </div>
      
      <div className="bg-card shadow-sm border-none p-6 rounded-lg mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.is_pinned && <Badge variant="secondary">Fixado</Badge>}
              {topic.is_solved && <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>}
              {topic.is_locked && <Badge variant="destructive">Bloqueado</Badge>}
              {topic.community_categories && (
                <Badge variant="outline">{topic.community_categories.name}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(topic.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{topic.view_count} visualizações</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count} respostas</span>
              </div>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{topic.content}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {topic.profiles?.avatar_url && (
              <img 
                src={topic.profiles.avatar_url} 
                alt={topic.profiles.name || 'Usuário'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{topic.profiles?.name || 'Usuário'}</span>
          </div>
        </div>
      </div>
      
      <CommunityLayout>
        <div className="space-y-6">
          <PostList topicId={topic.id} />
          
          {!topic.is_locked && (
            <div className="bg-card shadow-sm border-none p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Responder ao tópico</h3>
              <NewPostForm topicId={topic.id} />
            </div>
          )}
        </div>
      </CommunityLayout>
    </div>
  );
};

export default TopicView;
