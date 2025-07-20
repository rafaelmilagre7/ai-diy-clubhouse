
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityHero } from "@/components/community/CommunityHero";
import { EngagementMetrics } from "@/components/community/EngagementMetrics";
import { SearchBox } from "@/components/community/SearchBox";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { ActivityFeed } from "@/components/community/ActivityFeed";
import { TrendingWidget } from "@/components/community/TrendingWidget";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { TopicCardModern } from "@/components/community/TopicCardModern";
import { TopicListSkeleton } from "@/components/community/TopicListSkeleton";
import { TopicListError } from "@/components/community/TopicListError";
import { EmptyTopicsState } from "@/components/community/EmptyTopicsState";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { CommunityFilterType } from "@/types/communityTypes";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CommunityHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CommunityFilterType>("recentes");
  const [activeTab, setActiveTab] = useState("todos");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
  const { topics, isLoading, error, refetch } = useForumTopics({
    activeTab: "all",
    selectedFilter,
    searchQuery,
    categorySlug: activeTab
  });

  const pinnedTopics = topics.filter(topic => topic.is_pinned);
  const regularTopics = topics.filter(topic => !topic.is_pinned);

  const TopicsList = ({ topics: topicsList, showPinned = false }: { topics: typeof topics, showPinned?: boolean }) => {
    if (isLoading) return <TopicListSkeleton />;
    if (error) return <TopicListError onRetry={refetch} />;
    if (!topicsList || topicsList.length === 0) return <EmptyTopicsState searchQuery={searchQuery} />;

    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {topicsList.map((topic) => (
          <TopicCardModern 
            key={topic.id} 
            topic={topic} 
            showPreview={true}
            compact={viewMode === 'grid'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-viverblue/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-revenue/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-operational/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section */}
        <CommunityHero />

        {/* Métricas de Engajamento */}
        <EngagementMetrics />

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pesquisa Global */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <SearchBox
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Pesquisar discussões, categorias, usuários..."
              />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
                
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs de Categoria Redesigned */}
              <CategoryTabs categories={categories} isLoading={categoriesLoading} />

              {/* Filtros de Ordenação */}
              <div className="flex gap-2 my-4 overflow-x-auto pb-2">
                {(['recentes', 'populares', 'sem-respostas', 'resolvidos'] as CommunityFilterType[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="whitespace-nowrap"
                  >
                    {filter === 'recentes' && '🕒 Recentes'}
                    {filter === 'populares' && '🔥 Populares'}  
                    {filter === 'sem-respostas' && '❓ Sem Respostas'}
                    {filter === 'resolvidos' && '✅ Resolvidos'}
                  </Button>
                ))}
              </div>

              {/* Conteúdo das Tabs */}
              <TabsContent value="todos" className="mt-6">
                <div className="space-y-6">
                  {/* Tópicos Fixados */}
                  {pinnedTopics.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-foreground">📌 Tópicos Fixados</h3>
                        <Separator className="flex-1" />
                      </div>
                      <TopicsList topics={pinnedTopics} showPinned={true} />
                    </div>
                  )}

                  {/* Tópicos Regulares */}
                  {regularTopics.length > 0 && (
                    <div>
                      {pinnedTopics.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold text-foreground">💬 Todas as Discussões</h3>
                          <Separator className="flex-1" />
                        </div>
                      )}
                      <TopicsList topics={regularTopics} />
                    </div>
                  )}

                  {/* Estado vazio */}
                  {topics.length === 0 && !isLoading && (
                    <EmptyTopicsState searchQuery={searchQuery} />
                  )}
                </div>
              </TabsContent>

              {categories?.map((category) => (
                <TabsContent key={category.slug} value={category.slug} className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">{category.icon || '📁'}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                        {category.description && (
                          <p className="text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <TopicsList topics={topics} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar Redesigned */}
          <div className="lg:col-span-1 space-y-6">
            <CommunitySidebar />
            <ActivityFeed />
            <TrendingWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
