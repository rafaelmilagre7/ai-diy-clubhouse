
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { LucideIcon } from "lucide-react";
import { MessagesSquare } from "lucide-react";

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  slug: string;
  topic_count?: number;
  post_count?: number;
  last_post?: {
    id: string;
    title: string;
    created_at: string;
    user: {
      name: string;
      avatar_url: string;
    }
  } | null;
}

export const CategoryList = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as ForumCategory[];
    }
  });

  if (isLoading) {
    return <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-muted rounded-md w-1/3"></div>
            <div className="h-4 bg-muted rounded-md w-2/3 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-center py-10">
      <p className="text-red-500">Erro ao carregar categorias do fórum.</p>
      <p className="text-sm text-muted-foreground mt-2">Por favor, tente novamente mais tarde.</p>
    </div>;
  }

  return (
    <div className="space-y-4">
      {categories?.map((category) => (
        <Link key={category.id} to={`/forum/category/${category.slug}`}>
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tópicos: {category.topic_count || 0}</span>
                <span>Mensagens: {category.post_count || 0}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      
      {categories?.length === 0 && (
        <div className="text-center py-10">
          <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground mt-2">As categorias do fórum aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
};
