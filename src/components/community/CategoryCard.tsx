
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
}

export const CategoryCard = ({ id, name, description, slug, icon }: CategoryCardProps) => {
  // Buscar estatísticas da categoria
  const { data: stats } = useQuery({
    queryKey: ['category-stats', id],
    queryFn: async () => {
      const { count } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      return {
        topicCount: count || 0
      };
    }
  });

  return (
    <Link to={`/comunidade/categoria/${slug}`} className="block group">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-border/80 transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                {icon ? (
                  <span className="text-2xl">{icon}</span>
                ) : (
                  <MessageSquare className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                
                <Badge variant="secondary" className="text-xs">
                  {stats?.topicCount || 0} tópicos
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {stats?.topicCount || 0} discussões
                </span>
                
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
