
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Users, MessageSquare, Trophy, TrendingUp } from "lucide-react";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumStats } from "@/hooks/community/useForumStats";

export const CommunitySidebar = () => {
  const { categories } = useForumCategories();
  const { topicCount, postCount, activeUserCount, solvedCount } = useForumStats();

  return (
    <div className="space-y-6">
      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/comunidade/novo-topico">
              <MessageSquare className="h-4 w-4 mr-2" />
              Novo Tópico
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/comunidade/categorias">
              Ver Todas as Categorias
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tópicos</span>
            <Badge variant="secondary">{topicCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Respostas</span>
            <Badge variant="secondary">{postCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Usuários Ativos</span>
            <Badge variant="secondary">{activeUserCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resolvidos</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {solvedCount}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categories Quick Access */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Categorias Populares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/comunidade/categoria/${category.slug}`}
                className="block p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon || '📁'}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </Link>
            ))}
            
            {categories.length > 4 && (
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link to="/comunidade/categorias">
                  Ver todas ({categories.length})
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
