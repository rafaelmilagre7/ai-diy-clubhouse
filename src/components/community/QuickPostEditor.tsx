
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PencilLine, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";

export const QuickPostEditor = () => {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Buscar categorias para seleção rápida
  const { data: categories } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
  
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleExpandEditor = () => {
    setIsExpanded(true);
  };
  
  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/comunidade/novo-topico/${categorySlug}`);
  };
  
  return (
    <Card className="p-4 mb-6 relative">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
          <AvatarFallback>{getInitials(user?.user_metadata?.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {!isExpanded ? (
            <div 
              className="border rounded-lg px-4 py-2.5 flex cursor-text text-muted-foreground hover:bg-accent/50 transition-colors"
              onClick={handleExpandEditor}
            >
              <PencilLine className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>O que você gostaria de compartilhar ou perguntar?</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea 
                placeholder="O que você gostaria de compartilhar ou perguntar?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                autoFocus
              />
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-[70%]">
                  {categories?.map(category => (
                    <Button 
                      key={category.id} 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
                
                <Button onClick={() => navigate('/comunidade/novo-topico')}>
                  <Send className="h-4 w-4 mr-1" />
                  Criar Tópico
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
