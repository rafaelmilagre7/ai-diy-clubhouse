
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Eye, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { Post, Topic } from "@/types/forumTypes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { PostItem } from "@/components/community/PostItem";
import { SolutionBadge } from "@/components/community/SolutionBadge";
import { incrementTopicViews } from "@/lib/supabase/rpc";
import { useTopicSolution } from "@/hooks/community/useTopicSolution";
import { getInitials, getAvatarUrl } from "@/utils/user";

// Esquema de validação com Yup
const postSchema = yup.object({
  content: yup.string().required("O conteúdo do post é obrigatório"),
});

// Interface para os valores do formulário
interface FormData {
  content: string;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { user } = useAuth();
  const { profile } = useUser();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Configuração do react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(postSchema),
  });

  // Hook para gerenciar status de solução do tópico
  const {
    isSolved,
    isSubmitting: isSubmittingSolution,
    canMarkAsSolved,
    markAsSolved,
    unmarkAsSolved
  } = useTopicSolution({
    topicId: topicId || '',
    topicAuthorId: topic?.user_id || '',
    initialSolvedState: topic?.is_solved || false
  });

  // Ao carregar a página, incrementar o contador de visualizações
  useEffect(() => {
    if (topicId) {
      incrementTopicViews(topicId).catch(console.error);
    }
  }, [topicId]);

  useEffect(() => {
    if (topicId) {
      fetchTopicAndPosts(topicId);
    }
  }, [topicId, retryCount]);
  
  useEffect(() => {
    // Atualizar o estado isSolved quando o tópico for carregado
    if (topic) {
      const isTopicSolved = topic.is_solved || false;
      if (isTopicSolved !== isSolved) {
        // Atualizar o estado do hook para refletir o valor real do tópico
      }
    }
  }, [topic, isSolved]);

  const fetchTopicAndPosts = async (topicId: string) => {
    console.log("Iniciando busca do tópico:", topicId);
    setLoading(true);
    setError(null);
    
    try {
      // 1. Primeiro buscar o tópico principal com seu conteúdo básico
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          id, title, content, created_at, updated_at, last_activity_at,
          user_id, category_id, view_count, reply_count, is_pinned, is_locked, is_solved
        `)
        .eq('id', topicId)
        .single();

      if (topicError) {
        console.error("Erro ao buscar tópico:", topicError);
        throw new Error(`Falha ao carregar o tópico: ${topicError.message}`);
      }

      if (!topicData) {
        throw new Error("Tópico não encontrado");
      }

      // 2. Buscar os dados da categoria
      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('id', topicData.category_id)
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') { // Ignorar erro quando não encontra
        console.warn("Erro ao buscar categoria:", categoryError);
      }

      // 3. Buscar os dados do autor do tópico
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .eq('id', topicData.user_id)
        .single();

      if (authorError && authorError.code !== 'PGRST116') { // Ignorar erro quando não encontra
        console.warn("Erro ao buscar perfil do autor:", authorError);
      }

      // 4. Construir o objeto do tópico com todos os dados reunidos
      const formattedTopic: Topic = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        created_at: topicData.created_at,
        updated_at: topicData.updated_at,
        last_activity_at: topicData.last_activity_at,
        user_id: topicData.user_id,
        category_id: topicData.category_id,
        view_count: topicData.view_count || 0,
        reply_count: topicData.reply_count || 0,
        is_pinned: topicData.is_pinned || false,
        is_locked: topicData.is_locked || false,
        is_solved: topicData.is_solved || false,
        profiles: authorData || {
          id: topicData.user_id,
          name: 'Usuário',
          avatar_url: null,
          role: ''
        },
        category: categoryData || null
      };
      
      setTopic(formattedTopic);
      setCategoryId(topicData.category_id);
      
      // 5. Buscar as respostas/posts associados ao tópico
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id, content, user_id, topic_id, created_at, updated_at, is_solution, parent_id
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (postsError) {
        console.error("Erro ao buscar posts:", postsError);
        throw new Error(`Falha ao carregar as respostas: ${postsError.message}`);
      }

      // 6. Se não há posts, definir array vazio e encerrar
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 7. Buscar os dados de todos os autores dos posts em uma única consulta
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .in('id', userIds);

      if (usersError) {
        console.warn("Erro ao buscar perfis dos usuários:", usersError);
      }

      // 8. Mapear os posts com os dados dos usuários
      const formattedPosts: Post[] = postsData.map(post => {
        const userProfile = usersData?.find(user => user.id === post.user_id);
        
        return {
          id: post.id,
          content: post.content,
          user_id: post.user_id,
          topic_id: post.topic_id,
          created_at: post.created_at,
          updated_at: post.updated_at,
          is_solution: post.is_solution || false,
          parent_id: post.parent_id,
          profiles: userProfile || {
            id: post.user_id,
            name: 'Usuário',
            avatar_url: null,
            role: ''
          }
        };
      });

      setPosts(formattedPosts);
      
    } catch (err: any) {
      console.error("Erro ao buscar tópico e posts:", err.message);
      setError(`Falha ao carregar o tópico e as mensagens. ${err.message}`);
      toast.error(`Falha ao carregar o tópico. Tente novamente.`, {
        id: 'topic-error',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    if (!topicId || !user?.id) {
      toast.error("Não foi possível enviar a mensagem. Verifique se você está logado e se o tópico existe.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Insere o novo post no banco de dados
      const { data: newPost, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          content: values.content,
          topic_id: topicId,
          user_id: user.id,
        })
        .select(`
          id, content, user_id, topic_id, created_at, updated_at, is_solution, parent_id
        `)
        .single();

      if (postError) {
        throw postError;
      }

      // Buscar o perfil do usuário atual para adicionar ao novo post
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .eq('id', user.id)
        .single();

      // Atualiza o estado local adicionando o novo post com o perfil
      if (newPost) {
        const formattedPost: Post = {
          ...newPost,
          profiles: userProfile || {
            id: user.id,
            name: 'Usuário',
            avatar_url: null,
            role: ''
          }
        };
        
        setPosts(prevPosts => [...prevPosts, formattedPost]);
        reset(); // Limpa o formulário
        
        // Atualiza a contagem de respostas no tópico e a última atividade
        await supabase.rpc('increment_topic_replies', { topic_id: topicId });
        
        // Atualiza a data da última atividade no tópico
        await supabase
          .from('forum_topics')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', topicId);

        toast.success("Resposta enviada com sucesso!");
      }
    } catch (err: any) {
      console.error("Erro ao criar post:", err.message);
      setError("Falha ao enviar a mensagem. Por favor, tente novamente.");
      toast.error("Falha ao enviar a mensagem. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Manipulador para quando uma resposta é adicionada
  const handleReplyAdded = () => {
    // Recarregar posts
    if (topicId) {
      fetchTopicAndPosts(topicId);
    }
  };

  // Tratador para tentar novamente
  const handleRetry = () => {
    if (topicId) {
      setRetryCount(prev => prev + 1);
      toast.info("Tentando carregar o tópico novamente...");
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Carregando tópico...</h1>
            <p className="text-muted-foreground">Aguarde enquanto o tópico e as mensagens são carregados.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro ao carregar o tópico</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
            <p className="text-muted-foreground">O tópico que você está procurando não existe ou foi removido.</p>
            <Button asChild className="mt-4">
              <Link to="/comunidade">Voltar para a comunidade</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isTopicAuthor = user?.id === topic.user_id;
  const isTopic = !topic.is_locked;

  return (
    <div className="container px-4 py-6 mx-auto max-w-3xl">
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Avatar>
              <AvatarImage src={topic.profiles?.avatar_url ? getAvatarUrl(topic.profiles.avatar_url) : undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-semibold">{topic.title}</h1>
                {topic?.is_solved && <SolutionBadge isSolved={true} />}
                
                {topic?.category && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {topic.category.name}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <span>
                  Por {topic.profiles?.name || "Usuário"} em {format(new Date(topic.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          </div>
          <Separator className="mt-4" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{topic.view_count} visualizações</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{topic.reply_count} respostas</span>
            </div>
            
            {canMarkAsSolved && (
              <div className="ml-auto">
                <Button 
                  variant={topic.is_solved ? "outline" : "default"}
                  size="sm"
                  onClick={() => topic.is_solved ? unmarkAsSolved() : markAsSolved()}
                  disabled={isSubmittingSolution}
                  className={topic.is_solved ? "border-green-500 text-green-600" : ""}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {topic.is_solved ? "Remover solução" : "Marcar como resolvido"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Respostas</h2>
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                topicId={topicId || ""}
                isTopicAuthor={user?.id === topic.user_id}
                isAdmin={profile?.role === 'admin'}
                currentUserId={user?.id}
                onReplyAdded={handleReplyAdded}
                topicAuthorId={topic.user_id}
              />
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-2">Ainda não há respostas neste tópico.</p>
              <p className="text-muted-foreground">Seja o primeiro a responder!</p>
            </Card>
          )}
        </div>
      </div>

      {/* Formulário de nova resposta */}
      {user ? (
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar uma resposta</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Textarea
                  id="content"
                  placeholder="Escreva sua resposta..."
                  className="w-full"
                  {...register("content")}
                  disabled={topic.is_locked || submitting}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
                {topic.is_locked && (
                  <p className="text-amber-500 text-sm mt-1">Este tópico está trancado e não aceita novas respostas.</p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={submitting || topic.is_locked}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar resposta
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-6 text-center">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Você precisa estar <Link to="/login" className="text-primary underline">logado</Link> para responder a este tópico.
          </p>
        </Card>
      )}
    </div>
  );
};

export default TopicView;
