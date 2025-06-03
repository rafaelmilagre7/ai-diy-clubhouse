
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function CommunityPage() {
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select(`
          *,
          topics:forum_topics(count)
        `)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando comunidade..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Comunidade</h1>
        <p className="text-muted-foreground">
          Conecte-se com outros membros, compartilhe experiências e tire suas dúvidas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Card 
            key={category.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/comunidade/categoria/${category.slug}`)}
          >
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  <span>{category.name}</span>
                </CardTitle>
                <Badge variant="secondary">
                  {category.topics?.[0]?.count || 0} tópicos
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription>
                {category.description}
              </CardDescription>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Discussões ativas</span>
                </div>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo tópico
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Diretrizes da Comunidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Seja respeitoso e construtivo em suas interações
          </p>
          <p className="text-sm text-muted-foreground">
            • Compartilhe conhecimento e experiências práticas
          </p>
          <p className="text-sm text-muted-foreground">
            • Use as categorias adequadas para seus tópicos
          </p>
          <p className="text-sm text-muted-foreground">
            • Busque primeiro antes de criar um novo tópico
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
