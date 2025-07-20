
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Users, TrendingUp, Plus, Clock } from "lucide-react";

export const CommunitySidebar = () => {
  const { data: categories } = useQuery({
    queryKey: ['community-sidebar-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('forum_categories')
        .select(`
          *,
          forum_topics(count)
        `)
        .eq('is_active', true)
        .order('order_index');
      
      return data || [];
    },
    staleTime: 1000 * 60 * 3 // 3 minutos
  });

  const { data: activeMembers } = useQuery({
    queryKey: ['community-active-members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    },
    staleTime: 1000 * 60 * 3 // 3 minutos
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['community-recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('forum_topics')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      return data || [];
    },
    staleTime: 1000 * 60 * 3 // 3 minutos
  });

  const categoryColors = {
    'Geral': 'bg-blue-100 text-blue-700 border-blue-200',
    'Suporte': 'bg-red-100 text-red-700 border-red-200',
    'Implementação': 'bg-green-100 text-green-700 border-green-200',
    'Feedback': 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <div className="space-y-6">
      {/* Ações Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/comunidade/novo-topico">
              <MessageSquare className="h-4 w-4 mr-2" />
              Criar Tópico
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/comunidade?filter=popular">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Populares
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/comunidade/categoria/${category.slug}`}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors hover:bg-muted/50 ${
                  categoryColors[category.name as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon || '📁'}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.forum_topics?.[0]?.count || 0}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Membros Ativos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeMembers?.slice(0, 4).map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {member?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate">
                  {member?.name || 'Usuário'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="text-sm">
                <p className="text-muted-foreground line-clamp-2">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
