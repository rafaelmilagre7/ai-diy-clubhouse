
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, TrendingUp, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useForumTopics, TopicFilterType } from '@/hooks/community/useForumTopics';
import { TopicCard } from '@/components/community/TopicCard';
import { CategoryList } from '@/components/community/CategoryList';
import { ForumHeader } from '@/components/community/ForumHeader';

const CommunityMain = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TopicFilterType>('recentes');

  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
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
    <div className="min-h-screen bg-gray-50">
      <ForumHeader
        title="Comunidade Viver de IA"
        description="Conecte-se, aprenda e compartilhe conhecimento com outros membros"
      />
      
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar com categorias */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              {categoriesLoading ? (
                <div>Carregando categorias...</div>
              ) : (
                <CategoryList categories={categories} />
              )}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="xl:col-span-3 space-y-6">
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

            {/* Lista de tópicos */}
            {topicsLoading ? (
              <div>Carregando tópicos...</div>
            ) : (
              <div className="space-y-4">
                {/* Tópicos fixados */}
                {pinnedTopics.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      📌 Tópicos Fixados
                    </h3>
                    {pinnedTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} isPinned />
                    ))}
                  </div>
                )}

                {/* Tópicos regulares */}
                <div className="space-y-3">
                  {pinnedTopics.length > 0 && (
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Discussões Recentes
                    </h3>
                  )}
                  {regularTopics.length > 0 ? (
                    regularTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
                      <p className="mb-4">Seja o primeiro a iniciar uma discussão!</p>
                      <Button asChild>
                        <Link to="/comunidade/novo-topico">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar primeiro tópico
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMain;
