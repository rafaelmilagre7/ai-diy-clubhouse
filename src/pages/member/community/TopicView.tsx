
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { PostList } from "@/components/community/PostList";
import { NewPostForm } from "@/components/community/NewPostForm";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  MessageSquare, 
  Eye, 
  Clock, 
  Pin, 
  Lock, 
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Topic, Post } from "@/types/forumTypes";

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forum-topics', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          ),
          forum_categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Buscar posts do tópico
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  // Incrementar visualizações
  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('increment_topic_views', {
        topic_id: topicId
      });
      if (error) throw error;
    }
  });

  // Deletar tópico
  const deleteTopicMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tópico deletado com sucesso");
      navigate('/comunidade');
    },
    onError: (error) => {
      toast.error("Erro ao deletar tópico");
      console.error('Error deleting topic:', error);
    }
  });

  // Incrementar view quando o tópico carrega
  React.useEffect(() => {
    if (topic && user) {
      incrementViewMutation.mutate();
    }
  }, [topic, user]);

  const handleDeleteTopic = () => {
    if (window.confirm('Tem certeza que deseja deletar este tópico? Esta ação não pode ser desfeita.')) {
      deleteTopicMutation.mutate();
    }
  };

  const canEditOrDelete = user && (user.id === topic?.user_id || isAdmin);

  if (topicLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-1/3 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="h-32 bg-muted rounded-md mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded-md w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to="/comunidade" className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Comunidade</span>
          </Link>
        </Button>
        {topic.category && (
          <>
            <span className="text-muted-foreground">/</span>
            <Button variant="ghost" size="sm" asChild className="p-0">
              <Link to={`/comunidade/categoria/${topic.category.slug}`}>
                {topic.category.name}
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Cabeçalho do Tópico */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.is_pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
              {topic.is_locked && (
                <Badge variant="destructive" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
              {topic.is_solved && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{topic.view_count} visualizações</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count} respostas</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {canEditOrDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/comunidade/topico/${topicId}/editar`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteTopic}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Layout do Fórum */}
      <ForumLayout>
        {/* Conteúdo do Tópico */}
        <div className="bg-card p-6 rounded-lg border mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(topic.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p>{topic.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Posts */}
        <PostList 
          posts={posts || []} 
          isLoading={postsLoading} 
          error={postsError}
          topicId={topicId!}
        />

        {/* Formulário de Nova Resposta */}
        {user && !topic.is_locked && (
          <div className="mt-6">
            <NewPostForm 
              topicId={topicId!} 
              onPostCreated={() => {
                queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
                queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
              }}
            />
          </div>
        )}

        {!user && (
          <div className="mt-6 text-center p-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para responder a este tópico.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </div>
        )}
      </ForumLayout>
    </div>
  );
};

export default TopicView;
