
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, CircleAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
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
      return data as Category[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <CircleAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Erro ao carregar categorias</h3>
        <p className="text-muted-foreground">Não foi possível carregar as categorias da comunidade.</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhuma categoria encontrada</h3>
        <p className="text-muted-foreground">Não há categorias disponíveis na comunidade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="p-4 transition-all hover:bg-accent/50">
          <Link 
            to={`/comunidade/categoria/${category.slug}`}
            className="block"
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
};
