
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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

  return (
    <div className="min-h-screen community-header">
      <div className="content-section">
        <div className="content-container">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/comunidade">Comunidade</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/comunidade/categoria/${category.slug}`}>{category.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink>Novo Tópico</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="category-icon glow-primary">
                <Pencil className="h-6 w-6" />
              </div>
              <h1 className="text-responsive-xl font-heading text-aurora glow-text">
                Criar novo tópico
              </h1>
            </div>
            
            {category ? (
              <p className="text-responsive-base text-muted-foreground">
                Você está criando um tópico na categoria <strong className="text-aurora">{category.name}</strong>
              </p>
            ) : (
              <p className="text-responsive-base text-muted-foreground">
                Selecione uma categoria para seu tópico
              </p>
            )}
          </div>
          
          <div className="animate-slide-up">
            <ForumLayout>
              <NewTopicForm categoryId={category?.id} categorySlug={category?.slug} />
            </ForumLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTopic;
