
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { TopicCard } from '@/components/community/TopicCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Category = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  
  // Buscar dados da categoria
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['forum-category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug
  });
  
  // Buscar tópicos da categoria
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['forum-topics', categorySlug],
    queryFn: async () => {
      if (!category?.id) return [];
      
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', category.id)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });
      
      if (topicsError) throw topicsError;
      
      if (!topicsData || topicsData.length === 0) return [];
      
      // Buscar perfis dos autores
      const userIds = [...new Set(topicsData.map(topic => topic.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .in('id', userIds);
      
      // Mapear tópicos com dados dos perfis
      return topicsData.map(topic => ({
        ...topic,
        profiles: profiles?.find(p => p.id === topic.user_id) || null,
        category: category
      }));
    },
    enabled: !!category?.id
  });
  
  const isLoading = categoryLoading || topicsLoading;
  
  if (!categorySlug) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Categoria não especificada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!isLoading && !category) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para a Comunidade
          </Button>
        </div>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Categoria não encontrada ou não está ativa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para a Comunidade
        </Button>
      </div>
      
      <ForumBreadcrumbs 
        categoryName={category?.name}
        categorySlug={categorySlug}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {category?.name || 'Carregando...'}
          </h1>
          {category?.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
        </div>
        
        <Button onClick={() => navigate(`/comunidade/novo-topico/${categorySlug}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tópico
        </Button>
      </div>
      
      <CommunityNavigation />
      
      {/* Lista de Tópicos */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">
                Ainda não há tópicos nesta categoria
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Seja o primeiro a iniciar uma discussão!
              </p>
              <Button onClick={() => navigate(`/comunidade/novo-topico/${categorySlug}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro tópico
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {topics.length} {topics.length === 1 ? 'tópico encontrado' : 'tópicos encontrados'}
              </p>
            </div>
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
