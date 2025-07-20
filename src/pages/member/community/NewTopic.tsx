
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { NewTopicForm } from "@/components/community/NewTopicForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil } from "lucide-react";

interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
}

const NewTopic = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['community-category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();
      
      if (error) throw error;
      return data as CommunityCategory;
    },
    enabled: !!categorySlug
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-4"></div>
            <div className="h-10 bg-muted rounded-md w-full mb-4"></div>
            <div className="h-40 bg-muted rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || (categorySlug && !category)) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <Pencil className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Categoria não encontrada</h1>
          <p className="text-muted-foreground mt-2 mb-6">A categoria selecionada não existe ou foi removida.</p>
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
          <Link to={category ? `/comunidade/categoria/${category.slug}` : "/comunidade"} className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para {category ? category.name : 'a Comunidade'}</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-1">
        <Pencil className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Criar novo tópico</h1>
      </div>
      
      {category ? (
        <p className="text-muted-foreground mb-6">
          Você está criando um tópico na categoria <strong>{category.name}</strong>
        </p>
      ) : (
        <p className="text-muted-foreground mb-6">
          Por favor, selecione uma categoria para criar seu tópico
        </p>
      )}
      
      <CommunityLayout>
        {category ? (
          <NewTopicForm categoryId={category.id} categorySlug={category.slug} />
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">Selecione uma categoria</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Por favor, navegue até uma categoria específica para criar um novo tópico.
            </p>
            <Button asChild>
              <Link to="/comunidade">Ver categorias</Link>
            </Button>
          </div>
        )}
      </CommunityLayout>
    </div>
  );
};

export default NewTopic;
