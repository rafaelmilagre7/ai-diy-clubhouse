
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Plus, User, Clock } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function CategoryTopics() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: category } = useQuery({
    queryKey: ['forum-category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: topics, isLoading } = useQuery({
    queryKey: ['forum-topics', category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles!forum_topics_user_id_fkey(name, avatar_url)
        `)
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!category?.id
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando tópicos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/comunidade')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{category?.name}</h1>
          <p className="text-muted-foreground">{category?.description}</p>
        </div>
        
        <Button onClick={() => navigate(`/comunidade/novo-topico/${slug}`)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Tópico
        </Button>
      </div>

      <div className="space-y-4">
        {topics?.map((topic) => (
          <Card 
            key={topic.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/comunidade/topico/${topic.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{topic.profiles?.name || 'Usuário'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {topic.is_pinned && (
                    <Badge variant="secondary">Fixado</Badge>
                  )}
                  {topic.is_solved && (
                    <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
                  )}
                  <Badge variant="outline">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {topic.reply_count}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="line-clamp-2">
                {topic.content}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">Nenhum tópico ainda</CardTitle>
            <CardDescription className="mb-4">
              Seja o primeiro a iniciar uma discussão nesta categoria
            </CardDescription>
            <Button onClick={() => navigate(`/comunidade/novo-topico/${slug}`)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Tópico
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
