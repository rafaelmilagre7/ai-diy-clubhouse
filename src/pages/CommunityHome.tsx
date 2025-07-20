
import React, { useState } from "react";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumHeader } from "@/components/community/ForumHeader";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { CommunityFilters, FilterType } from "@/components/community/CommunityFilters";
import { TopicCard } from "@/components/community/TopicCard";
import { TopicsSkeleton } from "@/components/community/TopicsSkeleton";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const CommunityHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("recentes");
  const [activeCategory, setActiveCategory] = useState("todos");
  
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
  const { topics, isLoading: topicsLoading } = useForumTopics({
    activeTab: "all",
    selectedFilter,
    searchQuery
  });

  // Filtrar tópicos por categoria se uma categoria específica estiver selecionada
  const filteredTopics = React.useMemo(() => {
    if (activeCategory === "todos") {
      return topics;
    }
    
    const selectedCategoryData = categories.find(cat => cat.slug === activeCategory);
    if (!selectedCategoryData) return topics;
    
    return topics.filter(topic => topic.category_id === selectedCategoryData.id);
  }, [topics, activeCategory, categories]);

  const handleNewTopicClick = () => {
    navigate("/comunidade/novo-topico");
  };

  return (
    <ForumLayout
      sidebar={<CommunitySidebar />}
    >
      <div className="space-y-6">
        {/* Header Principal */}
        <div className="relative">
          {/* Background com gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Comunidade Viver de IA
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Conecte-se, aprenda e cresça junto com nossa comunidade de especialistas em IA
                </p>
              </div>
              
              <Button 
                onClick={handleNewTopicClick}
                size="lg"
                className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Novo Tópico
              </Button>
            </div>

            {/* Estatísticas */}
            <CommunityStats />
          </div>
        </div>

        {/* Sistema de Abas por Categoria */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-5 h-auto p-1">
              <TabsTrigger value="todos" className="min-w-max px-4 py-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Todos os Tópicos
              </TabsTrigger>
              {categories?.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.slug} 
                  className="min-w-max px-4 py-2"
                >
                  <span className="mr-2 text-lg">{category.icon || '📁'}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Filtros */}
          <CommunityFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Conteúdo das Abas */}
          <TabsContent value="todos" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Todos os Tópicos ({filteredTopics.length})
                </h2>
              </div>
              
              {topicsLoading ? (
                <TopicsSkeleton />
              ) : filteredTopics.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Tente ajustar sua busca' : 'Seja o primeiro a iniciar uma discussão!'}
                  </p>
                  <Button asChild>
                    <Link to="/comunidade/novo-topico">
                      Criar Primeiro Tópico
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {categories?.map((category) => (
            <TabsContent key={category.id} value={category.slug} className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon || '📁'}</span>
                    <div>
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link to={`/comunidade/novo-topico/${category.slug}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tópico
                    </Link>
                  </Button>
                </div>
                
                {topicsLoading ? (
                  <TopicsSkeleton />
                ) : filteredTopics.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Nenhum tópico em {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Seja o primeiro a iniciar uma discussão nesta categoria!
                    </p>
                    <Button asChild>
                      <Link to={`/comunidade/novo-topico/${category.slug}`}>
                        Criar Tópico em {category.name}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTopics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ForumLayout>
  );
};
