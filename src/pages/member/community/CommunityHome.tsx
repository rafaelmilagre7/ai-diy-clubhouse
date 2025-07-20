import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp, Plus, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useForumStats } from '@/hooks/useForumStats';
import { TopicCard } from '@/components/community/TopicCard';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topic_count?: number;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_activity_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string | null;
  } | null;
  category?: ForumCategory | null;
}

const fetchRecentTopics = async (): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      id, title, content, created_at, updated_at, user_id, category_id,
      view_count, reply_count, is_pinned, is_locked, is_solved, last_activity_at,
      profiles (id, name, avatar_url),
      category (id, name, slug)
    `)
    .order('last_activity_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Erro ao buscar tópicos recentes:", error);
    throw error;
  }

  return data || [];
};

const fetchPinnedTopics = async (): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      id, title, content, created_at, updated_at, user_id, category_id,
      view_count, reply_count, is_pinned, is_locked, is_solved, last_activity_at,
      profiles (id, name, avatar_url),
      category (id, name, slug)
    `)
    .eq('is_pinned', true)
    .order('last_activity_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("Erro ao buscar tópicos fixados:", error);
    throw error;
  }

  return data || [];
};

const fetchCategories = async (): Promise<ForumCategory[]> => {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }

  return data || [];
};

const CommunityHome = () => {
  const navigate = useNavigate();
  
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading: statsLoading, error: statsError } = useForumStats();

  const {
    data: recentTopics,
    isLoading: recentLoading,
    error: recentError,
  } = useQuery(['recentTopics'], fetchRecentTopics);

  const {
    data: pinnedTopics,
    isLoading: pinnedLoading,
    error: pinnedError,
  } = useQuery(['pinnedTopics'], fetchPinnedTopics);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery(['forumCategories'], fetchCategories);

  const isLoading = statsLoading || recentLoading || pinnedLoading || categoriesLoading;
  const error = statsError || recentError || pinnedError || categoriesError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando comunidade...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Erro ao carregar dados da comunidade
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Discussões da Comunidade</h1>
        <p className="text-xl text-muted-foreground">
          Participe das conversas mais relevantes
        </p>
        
        <Button 
          size="lg" 
          onClick={() => navigate('/comunidade/novo-topico/geral')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Tópico
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tópicos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUserCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Topics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTopics && recentTopics.length > 0 ? (
                recentTopics.map((topic) => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    compact={false}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum tópico encontrado. Seja o primeiro a iniciar uma discussão!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Categories Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/comunidade/categoria/${category.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {category.topic_count || 0}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma categoria disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pinned Topics */}
          {pinnedTopics && pinnedTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Tópicos Fixos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pinnedTopics.map((topic) => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    compact={true}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
