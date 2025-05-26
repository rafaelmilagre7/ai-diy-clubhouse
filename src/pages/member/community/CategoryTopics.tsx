
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { TopicCard } from '@/components/community/forum/TopicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Search, AlertCircle, MessageSquare } from 'lucide-react';
import { ForumCategory, Topic } from '@/types/forumTypes';

const CategoryTopics = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar categoria
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['forum-category', slug],
    queryFn: async (): Promise<ForumCategory | null> => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Buscar tópicos da categoria
  const { data: topics = [], isLoading: topicsLoading, error } = useQuery({
    queryKey: ['category-topics', category?.id, searchQuery],
    queryFn: async (): Promise<Topic[]> => {
      if (!category?.id) return [];
      
      let query = supabase
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
        .eq('category_id', category.id)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      // Aplicar filtro de busca se houver
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,content.ilike.%${searchQuery.trim()}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data?.map((topic: any) => ({
        ...topic,
        profiles: topic.profiles ? {
          id: topic.profiles.id,
          name: topic.profiles.name || 'Usuário',
          avatar_url: topic.profiles.avatar_url,
          role: topic.profiles.role || 'member',
          user_id: topic.profiles.id
        } : null,
        category: topic.forum_categories ? {
          id: topic.forum_categories.id,
          name: topic.forum_categories.name,
          slug: topic.forum_categories.slug
        } : null
      })) || [];
    },
    enabled: !!category?.id
  });

  const isLoading = categoryLoading || topicsLoading;

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Categoria não encontrada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Separar tópicos fixados dos regulares
  const pinnedTopics = topics.filter(topic => topic.is_pinned);
  const regularTopics = topics.filter(topic => !topic.is_pinned);

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={category.name} 
        categorySlug={category.slug}
      />
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Comunidade
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
          </div>
          <Button asChild>
            <Link to={`/comunidade/novo-topico?categoria=${category.slug}`}>
              <Plus className="h-4 w-4 mr-2" />
              Novo tópico
            </Link>
          </Button>
        </div>
        
        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nesta categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <CommunityNavigation />
      
      <div className="mt-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar tópicos. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        )}
        
        {topics.length === 0 && !error ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery.trim() ? 'Nenhum tópico encontrado' : 'Nenhum tópico nesta categoria'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery.trim() 
                  ? `Não encontramos tópicos com "${searchQuery.trim()}" nesta categoria`
                  : 'Seja o primeiro a iniciar uma discussão nesta categoria!'
                }
              </p>
              <Button asChild>
                <Link to={`/comunidade/novo-topico?categoria=${category.slug}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro tópico
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Tópicos Fixados */}
            {pinnedTopics.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  📌 Tópicos Fixados
                </h3>
                <div className="space-y-3">
                  {pinnedTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} isPinned />
                  ))}
                </div>
              </div>
            )}

            {/* Tópicos Regulares */}
            {regularTopics.length > 0 && (
              <div className="space-y-4">
                {pinnedTopics.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Discussões Recentes
                  </h3>
                )}
                <div className="space-y-3">
                  {regularTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTopics;
