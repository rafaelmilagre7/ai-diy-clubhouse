
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { MessageSquare, CircleAlert, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_activity_at: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface TopicListProps {
  categoryId: string;
  categorySlug: string;
}

export const TopicList = ({ categoryId, categorySlug }: TopicListProps) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 10;
  const [errorCount, setErrorCount] = useState<number>(0);

  // Usando useEffect para logs de diagnóstico
  useEffect(() => {
    console.log("TopicList montado:", {
      categoryId,
      categorySlug,
      currentPage
    });
    
    return () => {
      console.log("TopicList desmontado");
    };
  }, [categoryId, categorySlug, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['forumTopics', categoryId, currentPage],
    queryFn: async () => {
      try {
        console.log("Buscando tópicos para categoria:", categoryId, "página:", currentPage);
        
        // Verificação de segurança para categoryId
        if (!categoryId) {
          console.error("CategoryId está vazio ou inválido");
          return { 
            pinnedTopics: [],
            regularTopics: [],
            totalCount: 0
          };
        }
        
        // Primeiro buscar todos os tópicos fixados
        const { data: pinnedTopics, error: pinnedError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(*)
          `)
          .eq('category_id', categoryId)
          .eq('is_pinned', true)
          .order('last_activity_at', { ascending: false });
        
        if (pinnedError) {
          console.error("Erro ao buscar tópicos fixados:", pinnedError);
          throw pinnedError;
        }
        
        // Depois buscar os tópicos normais, paginados
        const { data: regularTopics, error: regularError, count } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(*)
          `, { count: 'exact' })
          .eq('category_id', categoryId)
          .eq('is_pinned', false)
          .order('last_activity_at', { ascending: false })
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
        
        if (regularError) {
          console.error("Erro ao buscar tópicos regulares:", regularError);
          throw regularError;
        }
        
        console.log("Tópicos carregados com sucesso:", {
          fixados: pinnedTopics?.length || 0,
          regulares: regularTopics?.length || 0,
          total: count || 0
        });
        
        return { 
          pinnedTopics: pinnedTopics as Topic[] || [],
          regularTopics: regularTopics as Topic[] || [],
          totalCount: count || 0
        };
      } catch (error: any) {
        console.error("Erro ao buscar tópicos:", error.message);
        setErrorCount(prev => prev + 1);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    meta: {
      onError: (err) => {
        console.error("Erro na query de tópicos:", err);
      }
    }
  });

  // Monitorar erros para exibir feedback ao usuário
  useEffect(() => {
    if (errorCount > 2) {
      toast.error("Problemas ao carregar os tópicos. Tentando novamente...", {
        id: "topic-list-error",
        duration: 3000
      });
    }
  }, [errorCount]);

  const handleRetry = () => {
    toast.info("Atualizando lista de tópicos...");
    setErrorCount(0);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium">Tópicos</h2>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </Button>
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-md animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="h-6 bg-muted rounded-md w-1/3"></div>
              <div className="h-6 bg-muted rounded-md w-20"></div>
            </div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <CircleAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Erro ao carregar tópicos</h3>
        <p className="text-muted-foreground mb-4">Não foi possível carregar os tópicos desta categoria.</p>
        <Button onClick={handleRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const pinnedTopics = data?.pinnedTopics || [];
  const regularTopics = data?.regularTopics || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasTopics = pinnedTopics.length > 0 || regularTopics.length > 0;

  if (!hasTopics) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhum tópico encontrado</h3>
        <p className="text-muted-foreground mb-6">
          Seja o primeiro a iniciar uma discussão nesta categoria.
        </p>
        <Button asChild className="flex items-center gap-2">
          <Link to={`/comunidade/novo-topico/${categorySlug}`}>
            <PlusCircle className="h-4 w-4" />
            <span>Criar Tópico</span>
          </Link>
        </Button>
      </div>
    );
  }

  const renderTopicItem = (topic: Topic, isPinned: boolean = false) => {
    // Função para obter as iniciais do nome do usuário
    const getInitials = (name: string | null) => {
      if (!name) return "??";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Tratar casos onde last_activity_at pode estar ausente
    const lastActivityDate = topic.last_activity_at ? new Date(topic.last_activity_at) : new Date(topic.created_at);

    return (
      <Card key={topic.id} className="mb-3 p-4 hover:bg-accent/50 transition-all">
        <Link to={`/comunidade/topico/${topic.id}`} className="block">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-medium">
                  {isPinned && <span className="text-primary mr-1">[Fixo] </span>}
                  {topic.is_locked && <span className="text-muted-foreground mr-1">[Trancado] </span>}
                  {topic.title}
                </h3>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {topic.reply_count}
                  </span>
                  <span>{topic.view_count} visualizações</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                <span>Por {topic.profiles?.name || "Usuário"}</span>
                <span>•</span>
                <span>
                  {format(lastActivityDate, "d 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-medium">Tópicos</h2>
        <Button asChild className="flex items-center gap-2">
          <Link to={`/comunidade/novo-topico/${categorySlug}`}>
            <PlusCircle className="h-4 w-4" />
            <span>Criar Tópico</span>
          </Link>
        </Button>
      </div>

      {pinnedTopics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Tópicos fixados</h3>
            <Separator className="flex-1" />
          </div>
          {pinnedTopics.map((topic) => renderTopicItem(topic, true))}
        </div>
      )}

      {regularTopics.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Todos os tópicos</h3>
            <Separator className="flex-1" />
          </div>
          {regularTopics.map((topic) => renderTopicItem(topic))}
        </>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-2">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
