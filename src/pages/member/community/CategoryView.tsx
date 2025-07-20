
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { TopicList } from "@/components/community/TopicList";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare } from "lucide-react";

interface CommunityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

const CategoryView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['community-category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as CommunityCategory;
    }
  });

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
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to="/comunidade" className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para a Comunidade</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>
      
      {category.description && (
        <p className="text-muted-foreground mb-6">{category.description}</p>
      )}
      
      <CommunityLayout>
        <TopicList categoryId={category.id} categorySlug={category.slug} />
      </CommunityLayout>
    </div>
  );
};

export default CategoryView;
