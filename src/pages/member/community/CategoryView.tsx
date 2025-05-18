
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, PlusCircle } from "lucide-react";
import { TopicCard } from "@/components/community/TopicCard";
import { Separator } from "@/components/ui/separator";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

const CategoryView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['forumCategory', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as ForumCategory;
    }
  });

  const { data: topics, isLoading: topicsLoading, error: topicsError } = useQuery({
    queryKey: ['forumTopics', category?.id],
    queryFn: async () => {
      if (!category?.id) return null;
      
      // Primeiro buscar todos os tópicos fixados
      const { data: pinnedTopics, error: pinnedError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('category_id', category.id)
        .eq('is_pinned', true)
        .order('last_activity_at', { ascending: false });
      
      if (pinnedError) throw pinnedError;
      
      // Depois buscar os tópicos normais
      const { data: regularTopics, error: regularError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('category_id', category.id)
        .eq('is_pinned', false)
        .order('last_activity_at', { ascending: false });
      
      if (regularError) throw regularError;
      
      return { 
        pinnedTopics,
        regularTopics
      };
    },
    enabled: !!category?.id
  });

  const isLoading = categoryLoading || topicsLoading;
  const error = categoryError || topicsError;

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted rounded-md w-1/3"></div>
                    <div className="h-6 bg-muted rounded-md w-20"></div>
                  </div>
                  <div className="h-4 bg-muted rounded-md w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Categoria não encontrada</h1>
          <p className="text-muted-foreground mt-2 mb-6">A categoria que você está procurando não existe ou foi removida.</p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to="/comunidade" className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para a Comunidade</span>
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/comunidade/novo-topico/${category.slug}`} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Criar Tópico</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>
      
      {category.description && (
        <p className="text-muted-foreground mb-6">{category.description}</p>
      )}
      
      <div className="space-y-6">
        {/* Tópicos fixados */}
        {topics?.pinnedTopics && topics.pinnedTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium">Tópicos fixados</h2>
              <Separator className="flex-1" />
            </div>
            <div className="space-y-3 mb-8">
              {topics.pinnedTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        )}
        
        {/* Tópicos regulares */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium">Todos os tópicos</h2>
            <Separator className="flex-1" />
          </div>
          
          {topics?.regularTopics && topics.regularTopics.length > 0 ? (
            <div className="space-y-3">
              {topics.regularTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhum tópico encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a iniciar uma discussão nesta categoria.
              </p>
              <Button asChild className="flex items-center gap-2 mx-auto">
                <Link to={`/comunidade/novo-topico/${category.slug}`}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Criar Tópico</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
