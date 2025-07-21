import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { PostList } from "@/components/community/PostList";
import { NewPostForm } from "@/components/community/NewPostForm";
import { MarkdownRenderer } from "@/components/community/MarkdownRenderer";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, MessageSquare, Pin, Lock, CheckCircle, User } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface CommunityTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id?: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  reply_count: number;
  view_count: number;
  last_activity_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['community-topic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_topics')
        .select(`
          *,
          profiles!community_topics_user_id_fkey(id, name, avatar_url),
          category:community_categories(id, name, slug)
        `)
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      return data as CommunityTopic;
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-4"></div>
            <div className="h-40 bg-muted rounded-md w-full"></div>
            <div className="h-6 bg-muted rounded-md w-1/4 mt-4"></div>
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to={topic.category ? `/comunidade/categoria/${topic.category.slug}` : "/comunidade"} className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para {topic.category ? topic.category.name : 'a Comunidade'}</span>
          </Link>
        </Button>
      </div>

      <CommunityLayout>
        <div className="space-y-6">
          {/* Cabeçalho do Tópico */}
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={topic.profiles?.avatar_url || ''} />
                <AvatarFallback className="bg-viverblue text-white">
                  {getInitials(topic.profiles?.name || 'Usuário')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold flex-1">{topic.title}</h1>
                  
                  {topic.is_pinned && (
                    <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
                      <Pin className="h-3 w-3" />
                      Fixado
                    </Badge>
                  )}
                  
                  {topic.is_locked && (
                    <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700">
                      <Lock className="h-3 w-3" />
                      Travado
                    </Badge>
                  )}
                  
                  {topic.is_solved && (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Resolvido
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                  <span>Por {topic.profiles?.name || 'Usuário'}</span>
                  <span>{formatDate(topic.created_at)}</span>
                  {topic.category && (
                    <Badge variant="outline" className="text-xs">
                      {topic.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Conteúdo do tópico com renderização de markdown */}
            <div className="mt-6">
              <MarkdownRenderer content={topic.content} />
            </div>
          </div>

          {/* Lista de Posts/Respostas */}
          <PostList topicId={topic.id} />

          {/* Formulário para Nova Resposta */}
          {!topic.is_locked && (
            <div className="bg-card shadow-sm border-none p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Responder</h3>
              <NewPostForm 
                topicId={topic.id} 
                onSuccess={() => {
                  // Recarregar as respostas
                  window.location.reload();
                }}
              />
            </div>
          )}
        </div>
      </CommunityLayout>
    </div>
  );
};

export default TopicView;
