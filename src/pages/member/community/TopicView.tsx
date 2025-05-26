import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock, Clock, Loader2, CircleUserRound, CheckCircle2, AlertCircle } from "lucide-react";
import { Post, Profile, Topic } from "@/types/forumTypes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getInitials } from "@/utils/user";

// Defina o schema de validação com Yup
const postSchema = yup.object({
  content: yup.string().required("O conteúdo do post é obrigatório"),
});

// Interface para os valores do formulário
interface FormData {
  content: string;
}

interface TopicFormData {
  title: string;
  content: string;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useUser();
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Configuração do react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(postSchema),
  });

  useEffect(() => {
    if (topicId) {
      fetchTopicAndPosts(topicId);
    }
  }, [topicId]);

  useEffect(() => {
    // Rola para o final da lista de posts sempre que novos posts são adicionados
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollTop = postsContainerRef.current.scrollHeight;
    }
  }, [posts]);

  const fetchTopicAndPosts = async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Busca os dados do tópico
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*),
          category:category_id(id, name, slug)
        `)
        .eq('id', topicId)
        .single();

      if (topicError) {
        throw topicError;
      }

      if (topicData) {
        // Garante que o dado retornado está no formato correto
        const formattedTopic: Topic = {
          id: topicData.id,
          title: topicData.title,
          content: topicData.content,
          created_at: topicData.created_at,
          updated_at: topicData.updated_at,
          last_activity_at: topicData.last_activity_at,
          user_id: topicData.user_id,
          category_id: topicData.category_id,
          view_count: topicData.view_count,
          reply_count: topicData.reply_count,
          is_pinned: topicData.is_pinned,
          is_locked: topicData.is_locked,
          profiles: topicData.profiles,
          category: topicData.category
        };
        
        setTopic(formattedTopic);
        setCategoryId(topicData.category_id); // Define o ID da categoria
      }

      // Busca os posts associados ao tópico, ordenados por data de criação
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (postsError) {
        throw postsError;
      }

      if (postsData) {
        setPosts(postsData as Post[]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar tópico e posts:", err.message);
      setError("Falha ao carregar o tópico e as mensagens. Por favor, tente novamente.");
      toast.error("Falha ao carregar o tópico e as mensagens. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const createNewTopic = async (values: TopicFormData) => {
    try {
      setSubmitting(true);
      
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          title: values.title,
          content: values.content,
          category_id: categoryId,
          user_id: user?.id,
          last_activity_at: new Date().toISOString(),
        })
        .select('*')
        .single();
        
      if (topicError) {
        throw topicError;
      }
      
      if (topicData) {
        // Atualiza o estado local ou redireciona conforme necessário
        toast.success("Tópico criado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error.message);
      toast.error("Erro ao criar tópico. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (values) => {
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
          *,
          profiles:user_id(*)
        `)
        .single();

      if (postError) {
        throw postError;
      }

      // Atualiza o estado local adicionando o novo post
      if (newPost) {
        setPosts(prevPosts => [...prevPosts, newPost as Post]);
        reset(); // Limpa o formulário
        
        // Atualiza a contagem de respostas no tópico
        await supabase.rpc('increment_topic_replies', { topic_id: topicId });
        
        // Atualiza a data da última atividade no tópico
        await supabase
          .from('forum_topics')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', topicId);
      }
    } catch (err: any) {
      console.error("Erro ao criar post:", err.message);
      setError("Falha ao enviar a mensagem. Por favor, tente novamente.");
      toast.error("Falha ao enviar a mensagem. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPostContent = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (loading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Carregando tópico...</h1>
          <p className="text-muted-foreground">Aguarde enquanto o tópico e as mensagens são carregados.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro ao carregar o tópico</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => { if (topicId) fetchTopicAndPosts(topicId); }}>Tentar novamente</Button>
        </Card>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground">O tópico que você está procurando não existe ou foi removido.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-3xl">
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Avatar>
              <AvatarImage src={topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold">{topic.title}</h1>
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
          <div className="prose max-w-none">
            {renderPostContent(topic.content)}
          </div>
          <Separator className="mt-4" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{topic.view_count} visualizações</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{posts.length} respostas</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Respostas</h2>
        <div className="space-y-4" ref={postsContainerRef}>
          {posts.map((post) => (
            <Card key={post.id} className="mb-3">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      {post.profiles?.name || "Usuário"} em {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none">
                  {renderPostContent(post.content)}
                </div>
              </div>
            </Card>
          ))}
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
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>
              <Button type="submit" disabled={submitting}>
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
