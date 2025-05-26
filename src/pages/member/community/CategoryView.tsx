
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
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="h-[400px] bg-card shadow-sm rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
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
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to="/comunidade" className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para a comunidade</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
        </div>
        
        <Button asChild className="hidden sm:flex gap-2">
          <Link to={`/comunidade/novo-topico/${category.slug}`}>
            <PlusCircle className="h-4 w-4" />
            <span>Novo tópico</span>
          </Link>
        </Button>
      </div>
      
      <ForumLayout>
        {category && <TopicList categoryId={category.id} categorySlug={category.slug} />}
      </ForumLayout>
      
      <div className="mt-6 sm:hidden">
        <Button asChild className="w-full">
          <Link to={`/comunidade/novo-topico/${category.slug}`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Novo tópico</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CategoryView;
