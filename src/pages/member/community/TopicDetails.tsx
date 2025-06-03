
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, User, Clock } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function TopicDetails() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const { data: topic, isLoading } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles!forum_topics_user_id_fkey(name, avatar_url),
          forum_categories(name, slug)
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: posts } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_user_id_fkey(name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at');

      if (error) throw error;
      return data;
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando tópico..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/comunidade/categoria/${topic?.forum_categories?.slug}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para {topic?.forum_categories?.name}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {topic?.is_pinned && (
              <Badge variant="secondary">Fixado</Badge>
            )}
            {topic?.is_solved && (
              <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{topic?.title}</h1>
        </div>
      </div>

      {/* Tópico principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{topic?.profiles?.name || 'Usuário'}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date(topic?.created_at || '').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {topic?.content}
          </div>
        </CardContent>
      </Card>

      {/* Respostas */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-xl font-semibold">
            Respostas ({posts?.length || 0})
          </h2>
        </div>

        {posts?.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{post.profiles?.name || 'Usuário'}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {post.is_solution && (
                  <Badge className="bg-green-100 text-green-800">Solução</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {post.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
