
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, Eye, Clock, AlertTriangle, Pin, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/community/ReplyForm";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Post, Topic } from "@/types/forumTypes";

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Verificar se o usuário possui papel de admin
  useEffect(() => {
    const checkIsAdmin = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Erro ao verificar papel do usuário:', error);
      }
    };
    
    checkIsAdmin();
  }, [user]);
  
  // Buscar dados do tópico
  const { 
    data: topic, 
    isLoading: topicLoading, 
    error: topicError 
  } = useQuery({
    queryKey: ['forumTopic', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do tópico não fornecido');
      
      try {
        // Incrementar visualização
        await supabase.rpc('increment_topic_views', { topic_id: id });
        
        // Buscar tópico
        const { data, error } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(*),
            category:category_id(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Tópico não encontrado');
        
        return data as Topic;
      } catch (error) {
        console.error('Erro ao buscar tópico:', error);
        throw error;
      }
    },
    retry: false,
  });
  
  // Buscar posts/respostas
  const { 
    data: posts, 
    isLoading: postsLoading, 
    refetch: refetchPosts 
  } = useQuery({
    queryKey: ['forumPosts', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do tópico não fornecido');
      
      // Buscar todos os posts do tópico
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Organizar posts em hierarquia (posts principais e respostas aninhadas)
      const mainPosts: Post[] = [];
      const repliesMap: Record<string, Post[]> = {};
      
      // Primeiro, separar posts principais e respostas
      data.forEach(post => {
        if (!post.parent_id) {
          mainPosts.push(post as Post);
        } else {
          if (!repliesMap[post.parent_id]) {
            repliesMap[post.parent_id] = [];
          }
          repliesMap[post.parent_id].push(post as Post);
        }
      });
      
      // Depois, adicionar respostas aos posts principais
      mainPosts.forEach(post => {
        if (repliesMap[post.id]) {
          post.replies = repliesMap[post.id];
        }
      });
      
      return mainPosts;
    },
    enabled: !!topic,
  });
  
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const togglePinned = async () => {
    if (!topic) return;
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !topic.is_pinned })
        .eq('id', topic.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['forumTopic', id] });
      toast.success(topic.is_pinned ? 'Tópico desfixado com sucesso!' : 'Tópico fixado com sucesso!');
    } catch (error) {
      console.error('Erro ao fixar/desfixar tópico:', error);
      toast.error('Erro ao processar solicitação');
    }
  };
  
  const toggleLocked = async () => {
    if (!topic) return;
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !topic.is_locked })
        .eq('id', topic.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['forumTopic', id] });
      toast.success(topic.is_locked ? 'Tópico desbloqueado com sucesso!' : 'Tópico bloqueado com sucesso!');
    } catch (error) {
      console.error('Erro ao bloquear/desbloquear tópico:', error);
      toast.error('Erro ao processar solicitação');
    }
  };
  
  if (topicError) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-5xl">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tópico não encontrado</h2>
          <p className="text-muted-foreground mb-6">O tópico que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-5xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>
      
      {topicLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : topic ? (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              {topic.category && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {topic.category.name}
                </Badge>
              )}
              
              {topic.is_pinned && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
              
              {topic.is_locked && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{topic.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{topic.reply_count} respostas</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{topic.view_count} visualizações</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(topic.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
            
            <Card className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={topic.profiles?.avatar_url || undefined} alt={topic.profiles?.name || 'Usuário'} />
                  <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium">{topic.profiles?.name || "Usuário"}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(topic.created_at), "d 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Autor
                    </span>
                  </div>
                  
                  <div className="mt-2 prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: topic.content }} />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Ações de administrador */}
            {isAdmin && (
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={togglePinned}
                >
                  <Pin className="h-4 w-4 mr-1" />
                  {topic.is_pinned ? 'Desfixar tópico' : 'Fixar tópico'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleLocked}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  {topic.is_locked ? 'Desbloquear tópico' : 'Bloquear tópico'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Seção de resposta principal */}
          {!topic.is_locked && (
            <div className="mb-10">
              <h2 className="text-lg font-medium mb-3">Sua resposta</h2>
              <ReplyForm 
                topicId={topic.id} 
                onSuccess={() => refetchPosts()}
              />
            </div>
          )}
          
          {/* Seção de respostas */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">
              {topic.reply_count === 0 
                ? 'Nenhuma resposta ainda' 
                : topic.reply_count === 1 
                  ? '1 resposta' 
                  : `${topic.reply_count} respostas`}
            </h2>
            
            {postsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    topicId={topic.id}
                    isTopicAuthor={post.user_id === topic.user_id}
                    isLocked={topic.is_locked}
                    onReplyAdded={() => refetchPosts()}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Seja o primeiro a responder a este tópico!</p>
              </Card>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TopicView;
