
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, MessageSquare, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useCommunityStats } from "@/hooks/community/useCommunityStats";

export const CommunitySidebar = () => {
  const { topicCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();

  return (
    <div className="space-y-6">
      {/* Ação Principal */}
      <Card>
        <CardContent className="p-4">
          <Button asChild className="w-full mb-4">
            <Link to="/comunidade/novo-topico">
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Tópico
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Compartilhe suas dúvidas, experiências e conhecimento com a comunidade.
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Tópicos</span>
                </div>
                <span className="font-semibold">{topicCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Membros Ativos</span>
                </div>
                <span className="font-semibold">{activeUserCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Resolvidos</span>
                </div>
                <span className="font-semibold">{solvedCount}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diretrizes da Comunidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diretrizes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Seja respeitoso e construtivo</p>
          <p>• Use títulos claros e descritivos</p>
          <p>• Busque antes de perguntar</p>
          <p>• Compartilhe experiências práticas</p>
          <p>• Marque soluções quando encontrar</p>
        </CardContent>
      </Card>
    </div>
  );
};
