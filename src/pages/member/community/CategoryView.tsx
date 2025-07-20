
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { TopicList } from "@/components/community/TopicList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ForumCategory } from "@/types/forumTypes";

const CategoryView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['forumCategory', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Nenhum slug fornecido');
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as ForumCategory;
    },
    enabled: !!slug,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="min-h-screen community-header">
        <div className="content-section">
          <div className="content-container">
            <div className="animate-pulse space-y-6">
              <div className="aurora-skeleton h-8 w-1/4 mb-4"></div>
              <div className="aurora-skeleton h-4 w-1/2 mb-8"></div>
              <div className="aurora-skeleton h-[400px] rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen community-header">
        <div className="content-section">
          <div className="content-container">
            <div className="empty-state">
              <AlertCircle className="empty-state-icon" />
              <h1 className="empty-state-title">Categoria não encontrada</h1>
              <p className="empty-state-description mb-6">
                A categoria que você está procurando não existe ou foi removida.
              </p>
              <button className="aurora-button">
                <Link to="/comunidade">Voltar para a Comunidade</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen community-header">
      <div className="content-section">
        <div className="content-container">
          {/* Navegação de volta */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild className="aurora-button p-2">
              <Link to="/comunidade" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Voltar para a comunidade</span>
              </Link>
            </Button>
          </div>
          
          {/* Header da categoria com estilo Aurora */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div className="space-y-4">
              <h1 className="text-responsive-xl font-heading text-aurora glow-text">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-responsive-base text-muted-foreground max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
            
            <button className="aurora-button hidden md:flex items-center gap-2">
              <Link to={`/comunidade/novo-topico/${category.slug}`} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Novo tópico</span>
              </Link>
            </button>
          </div>
          
          {/* Lista de tópicos com layout Aurora */}
          <div className="animate-slide-up">
            <ForumLayout>
              {category && <TopicList categoryId={category.id} categorySlug={category.slug} />}
            </ForumLayout>
          </div>
          
          {/* FAB para mobile */}
          <Link to={`/comunidade/novo-topico/${category.slug}`} className="aurora-fab md:hidden">
            <PlusCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
