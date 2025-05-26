import React, { useState } from 'react';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { ForumHeader } from './ForumHeader';
import { ForumSearch } from './ForumSearch';
import { TopicCard } from './TopicCard';
import { CategoryList } from './CategoryList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkoolStyleForum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'recentes' | 'populares' | 'sem-respostas' | 'resolvidos'>('recentes');

  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
  const { data: topics = [], isLoading: topicsLoading } = useForumTopics({
    activeTab: 'todos',
    selectedFilter,
    searchQuery,
    categories
  });

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
              <div className="flex-1">
                <ForumSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                />
              </div>
              
              <Button asChild>
                <Link to="/comunidade/novo-topico">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo tópico
                </Link>
              </Button>
            </div>

            {/* Lista de tópicos */}
            {topicsLoading ? (
              <div>Carregando tópicos...</div>
            ) : (
              <div className="space-y-4">
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
