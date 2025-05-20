
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { NewTopicForm } from "@/components/community/NewTopicForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForumCategories } from "@/hooks/community/useForumCategories";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
}

const NewTopic = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [loadingRedirect, setLoadingRedirect] = useState(false);
  
  // Buscar todas as categorias para fallback
  const { categories: allCategories, isLoading: loadingAllCategories } = useForumCategories();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['forumCategory', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      console.log("Buscando categoria:", categorySlug);
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();
      
      if (error) {
        console.error("Erro ao buscar categoria:", error);
        throw error;
      }
      console.log("Categoria encontrada:", data);
      return data as ForumCategory;
    },
    enabled: !!categorySlug
  });

  // Redirecionar para a primeira categoria disponível se a atual não existir
  useEffect(() => {
    if (!isLoading && !loadingAllCategories && !category && allCategories.length > 0 && categorySlug) {
      setLoadingRedirect(true);
      const firstCategory = allCategories[0];
      console.log("Categoria não encontrada, redirecionando para:", firstCategory.slug);
      navigate(`/comunidade/novo-topico/${firstCategory.slug}`, { replace: true });
    }
  }, [category, isLoading, categorySlug, allCategories, loadingAllCategories, navigate]);

  if (isLoading || loadingAllCategories || loadingRedirect) {
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
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="p-0">
            <Link to="/comunidade" className="flex items-center">
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para a Comunidade</span>
            </Link>
          </Button>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Categoria não encontrada</AlertTitle>
          <AlertDescription>
            A categoria solicitada não existe ou foi removida.
            {allCategories.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Categorias disponíveis:</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <Button key={cat.id} size="sm" variant="outline" asChild>
                      <Link to={`/comunidade/novo-topico/${cat.slug}`}>{cat.name}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="text-center py-6">
          <Pencil className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Selecione uma categoria</h1>
          <p className="text-muted-foreground mt-2 mb-6">Para criar um novo tópico, escolha uma das categorias disponíveis.</p>
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
      
      <ForumLayout>
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
      </ForumLayout>
    </div>
  );
};

export default NewTopic;
