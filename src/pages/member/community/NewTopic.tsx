
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { NewTopicForm } from "@/components/community/NewTopicForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, AlertCircle, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-muted to-muted/60 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gradient-to-r from-muted to-muted/60 rounded-lg w-1/2"></div>
            <div className="backdrop-blur-sm bg-card/40 border border-border/30 rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="h-6 bg-gradient-to-r from-muted to-muted/60 rounded-lg w-1/3"></div>
                <div className="h-12 bg-gradient-to-r from-muted to-muted/60 rounded-xl w-full"></div>
                <div className="h-48 bg-gradient-to-r from-muted to-muted/60 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        {/* Breadcrumb com estilo Aurora */}
        <div className="mb-6">
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-muted-foreground">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/comunidade" className="hover:text-primary transition-colors duration-200">
                    Comunidade
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/comunidade/categoria/${category.slug}`} className="hover:text-primary transition-colors duration-200">
                        {category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink className="text-foreground font-medium">Novo Tópico</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Header com gradiente */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-lg rounded-full"></div>
              <Pencil className="relative h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Criar novo tópico
            </h1>
          </div>
          
          {category ? (
            <p className="text-muted-foreground text-lg">
              Você está criando um tópico na categoria{" "}
              <span className="font-semibold text-primary">{category.name}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-lg">
              Selecione uma categoria para seu tópico
            </p>
          )}
        </div>
        
        {/* Formulário com glassmorphism */}
        <div className="backdrop-blur-sm bg-card/40 border border-border/30 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10 p-1">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl">
              <ForumLayout>
                <NewTopicForm categoryId={category?.id} categorySlug={category?.slug} />
              </ForumLayout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTopic;
