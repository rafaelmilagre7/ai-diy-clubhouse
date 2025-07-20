
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Topic, Post } from "@/types/forumTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  MessageSquare, 
  Eye, 
  Clock, 
  User, 
  Send,
  Pin,
  Lock,
  CheckCircle,
  Flag,
  Trash2,
  Edit3
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForumCache } from "@/hooks/community";

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();
  const forumCache = useForumCache();

  // Query para buscar o tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forum-topics', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error("ID do tópico não fornecido");
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          forum_categories:category_id(name, slug, color)
        `)
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Query para buscar posts do tópico
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  // Incrementar visualizações quando o tópico carrega
  useEffect(() => {
    if (topic && topicId) {
      supabase.rpc('increment_topic_views', { topic_id: topicId });
    }
  }, [topic, topicId]);

  // Mutation para criar nova resposta
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !topicId) throw new Error("Usuário não autenticado ou tópico inválido");
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          content,
          user_id: user.id,
          topic_id: topicId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      forumCache.invalidateStats();
      setReplyContent("");
      toast.success("Resposta adicionada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar resposta:", error);
      toast.error("Erro ao adicionar resposta. Tente novamente.");
    }
  });

  // Mutation para editar post
  const editPostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      setEditingPostId(null);
      setEditContent("");
      toast.success("Post editado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao editar post:", error);
      toast.error("Erro ao editar post. Tente novamente.");
    }
  });

  // Mutation para deletar post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      forumCache.invalidateStats();
      toast.success("Post removido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deletar post:", error);
      toast.error("Erro ao remover post. Tente novamente.");
    }
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    createReplyMutation.mutate(replyContent.trim());
  };

  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingPostId) return;
    editPostMutation.mutate({ postId: editingPostId, content: editContent.trim() });
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Tem certeza que deseja remover este post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  if (topicLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            O tópico que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/comunidade" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar para a Comunidade
          </Link>
        </Button>
      </div>

      {/* Topic Header */}
      <Card className="mb-6">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {topic.is_pinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Fixado
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Bloqueado
                  </Badge>
                )}
                {topic.is_solved && (
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Resolvido
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold">{topic.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {topic.profiles?.name || "Usuário"}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(topic.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {topic.view_count} visualizações
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {topic.reply_count} respostas
                </div>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        {postsLoading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles?.avatar_url || ""} />
                      <AvatarFallback>
                        {post.profiles?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.profiles?.name || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {user?.id === post.user_id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post.id, post.content)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingPostId === post.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} disabled={editPostMutation.isPending}>
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingPostId(null);
                          setEditContent("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      {user && !topic.is_locked ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Adicionar Resposta</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createReplyMutation.isPending || !replyContent.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {createReplyMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : topic.is_locked ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Este tópico está bloqueado para novas respostas.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para responder a este tópico.
            </p>
            <Button asChild>
              <Link to="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicView;
