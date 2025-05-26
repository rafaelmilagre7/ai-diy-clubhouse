
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { TopicDetailView } from '@/components/community/TopicDetailView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Topic } from '@/types/forumTypes';
import { incrementTopicViews } from '@/lib/supabase/rpc';

const TopicDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['forum-topic-detail', id],
    queryFn: async (): Promise<Topic | null> => {
      if (!id) return null;
      
      console.log('Buscando tópico:', id);
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          ),
          forum_categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Erro ao buscar tópico:', error);
        throw error;
      }
      
      if (data) {
        // Incrementar contador de visualizações
        await incrementTopicViews(id);
      }
      
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para Comunidade
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tópico não encontrado ou ocorreu um erro ao carregá-lo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topic.category?.name} 
        categorySlug={topic.category?.slug}
        topicTitle={topic.title} 
      />
      
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (topic.category?.slug) {
              navigate(`/comunidade/categoria/${topic.category.slug}`);
            } else {
              navigate('/comunidade');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>
      
      <CommunityNavigation />
      
      <div className="mt-6">
        <TopicDetailView topic={topic} />
      </div>
    </div>
  );
};

export default TopicDetailPage;
