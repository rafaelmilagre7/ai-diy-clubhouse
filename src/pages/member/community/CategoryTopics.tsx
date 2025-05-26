
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { TopicCard } from '@/components/community/forum/TopicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Search, MessageSquare } from 'lucide-react';
import { ForumCategory, Topic } from '@/types/forumTypes';
import { toast } from 'sonner';

type FilterType = 'recentes' | 'populares' | 'sem-respostas' | 'resolvidos';

const CategoryTopics = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('recentes');

  // Buscar categoria
  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['forum-category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) throw new Error('Slug da categoria não fornecido');
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
        
      if (error) throw error;
      return data as ForumCategory;
    },
    enabled: !!categorySlug,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          toast.error("Categoria não encontrada");
          navigate('/comunidade', { replace: true });
        }
      }
    }
  });

  // Buscar tópicos da categoria
  const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useQuery({
    queryKey: ['category-topics', category?.id, selectedFilter, searchQuery],
    queryFn: async () => {
      if (!category?.id) return [];

      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:profiles!forum_topics_user_id_fkey (
            id,
            name,
            avatar_url,
            role
          ),
          forum_categories:forum_categories!forum_topics_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('category_id', category.id);

      // Aplicar filtros
      switch (selectedFilter) {
        case 'populares':
          query = query.order('view_count', { ascending: false });
          break;
        case 'sem-respostas':
          query = query.eq('reply_count', 0).order('created_at', { ascending: false });
          break;
        case 'resolvidos':
          query = query.eq('is_solved', true).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('last_activity_at', { ascending: false });
          break;
      }

      // Aplicar busca
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery.trim()}%,content.ilike.%${searchQuery.trim()}%`);
      }

      // Ordenar tópicos fixados primeiro
      query = query.order('is_pinned', { ascending: false });
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data as Topic[];
    },
    enabled: !!category?.id
  });

  if (categoryLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-8 bg-neutral-800 rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <p className="text-muted-foreground mb-6">A categoria que você está procurando não existe.</p>
          <Button asChild>
            <Link to="/comunidade">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à comunidade
            </Link>
          </Button>
        </div>
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
          Voltar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
        </div>
        <Button asChild>
          <Link to={`/comunidade/novo-topico/${category.slug}`}>
            <Plus className="h-4 w-4 mr-2" />
            Novo tópico
          </Link>
        </Button>
      </div>

      <CommunityNavigation />

      {/* Controles de busca e filtro */}
      <div className="flex flex-col lg:flex-row gap-4 mt-6 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as FilterType)}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="populares">Mais populares</SelectItem>
            <SelectItem value="sem-respostas">Sem respostas</SelectItem>
            <SelectItem value="resolvidos">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de tópicos */}
      {topicsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-neutral-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-neutral-800 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : topics.length > 0 ? (
        <div className="space-y-6">
          {/* Tópicos Fixados */}
          {pinnedTopics.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                📌 Tópicos Fixados
              </h3>
              <div className="space-y-2">
                {pinnedTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} isPinned />
                ))}
              </div>
            </div>
          )}

          {/* Tópicos Regulares */}
          <div className="space-y-3">
            {pinnedTopics.length > 0 && (
              <h3 className="text-sm font-medium text-muted-foreground">
                Discussões Recentes
              </h3>
            )}
            <div className="space-y-2">
              {regularTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery.trim() ? 'Nenhum tópico encontrado' : 'Nenhum tópico ainda'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery.trim() 
                ? `Não encontramos tópicos com "${searchQuery.trim()}"`
                : `Seja o primeiro a criar um tópico em ${category.name}!`
              }
            </p>
            <Button asChild>
              <Link to={`/comunidade/novo-topico/${category.slug}`}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro tópico
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {topicsError && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Erro ao carregar tópicos. Tente novamente mais tarde.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryTopics;
