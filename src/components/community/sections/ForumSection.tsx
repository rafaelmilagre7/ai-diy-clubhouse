
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, TrendingUp, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { TopicCard } from '@/components/community/forum/TopicCard';
import { CategoryList } from '@/components/community/CategoryList';

export const ForumSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'recentes' | 'populares' | 'sem-respostas' | 'resolvidos'>('recentes');

  const { categories } = useForumCategories();
  
  const { data: topicsData, isLoading: topicsLoading } = useForumTopics({
    selectedFilter: activeFilter,
    searchQuery
  });

  const filters = [
    { id: 'recentes' as const, label: 'Recentes', icon: Clock },
    { id: 'populares' as const, label: 'Em Alta', icon: TrendingUp },
    { id: 'sem-respostas' as const, label: 'Sem Respostas', icon: MessageSquare },
    { id: 'resolvidos' as const, label: 'Resolvidos', icon: CheckCircle },
  ];

  const topics = topicsData?.topics || [];
  // Separar tópicos fixados dos regulares
  const pinnedTopics = topics.filter(topic => topic.is_pinned);
  const regularTopics = topics.filter(topic => !topic.is_pinned);

  return (
    <div className="space-y-8">
      {/* Header com busca e novo tópico */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar discussões, tópicos ou soluções..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button asChild>
          <Link to="/comunidade/novo-topico">
            <Plus className="h-4 w-4 mr-2" />
            Novo tópico
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <filter.icon className="h-4 w-4" />
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Lista de tópicos */}
        <div className="xl:col-span-3">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Discussões Recentes</h2>
              
              {topicsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
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
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        📌 Tópicos Fixados
                      </h3>
                      <div className="space-y-3">
                        {pinnedTopics.slice(0, 3).map((topic) => (
                          <TopicCard key={topic.id} topic={topic} isPinned />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tópicos Regulares */}
                  <div className="space-y-4">
                    {pinnedTopics.length > 0 && (
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Discussões Recentes
                      </h3>
                    )}
                    <div className="space-y-3">
                      {regularTopics.slice(0, 10).map((topic) => (
                        <TopicCard key={topic.id} topic={topic} />
                      ))}
                    </div>
                  </div>

                  {/* Link para ver mais */}
                  {topics.length > 10 && (
                    <div className="text-center pt-6">
                      <Button variant="outline" asChild>
                        <Link to="/comunidade">Ver todas as discussões</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'Nenhuma discussão encontrada' : 'Seja o primeiro a iniciar uma discussão!'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? 'Tente ajustar os filtros ou termos de busca.'
                        : 'Compartilhe suas dúvidas, ideias ou conhecimentos com a comunidade.'
                      }
                    </p>
                    <Button asChild>
                      <Link to="/comunidade/novo-topico">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeiro tópico
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar com categorias */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <CategoryList categories={categories} compact />
          </div>
        </div>
      </div>
    </div>
  );
};
