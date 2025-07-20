
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { TopicList } from "@/components/community/TopicList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, AlertCircle, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-muted to-muted/60 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gradient-to-r from-muted to-muted/60 rounded-lg w-1/2"></div>
            <div className="h-[400px] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="text-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
              <AlertCircle className="relative h-16 w-16 mx-auto text-muted-foreground mb-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              Categoria não encontrada
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              A categoria que você está procurando não existe ou foi removida.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/comunidade" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Voltar para a Comunidade
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        {/* Header com navegação */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-accent/60 transition-colors duration-200">
            <Link to="/comunidade" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para a comunidade</span>
            </Link>
          </Button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
            
            <Button asChild className="hidden lg:flex gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group">
              <Link to={`/comunidade/novo-topico/${category.slug}`}>
                <PlusCircle className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Novo tópico</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Conteúdo principal com glassmorphism */}
        <div className="backdrop-blur-sm bg-card/40 border border-border/30 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10 p-1">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl">
              <ForumLayout>
                {category && <TopicList categoryId={category.id} categorySlug={category.slug} />}
              </ForumLayout>
            </div>
          </div>
        </div>
        
        {/* Botão mobile */}
        <div className="mt-8 lg:hidden">
          <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group py-6">
            <Link to={`/comunidade/novo-topico/${category.slug}`}>
              <PlusCircle className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-lg">Novo tópico</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
