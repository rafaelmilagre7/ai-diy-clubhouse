
import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useForumStats } from "@/hooks/useForumStats";
import { QuickPostInput } from "@/components/community/QuickPostInput";
import { TopicCard } from "@/components/community/TopicCard";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { ForumStatistics } from "@/components/community/ForumStatistics";
import { ForumSearch } from "@/components/community/ForumSearch";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { TopicsSkeleton } from "@/components/community/TopicsSkeleton";
import { EmptyTopicsState } from "@/components/community/EmptyTopicsState";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";

const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const { user } = useAuth();
  const { topicCount, postCount, activeUserCount, isLoading: statsLoading } = useForumStats();

  // Log para debugging
  useEffect(() => {
    console.log("CommunityHome renderizado:", { 
      path: window.location.pathname,
      authenticated: !!user,
      activeTab,
      selectedFilter
    });
  }, [user, activeTab, selectedFilter]);

  // Buscar categorias
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useForumCategories();

  // Buscar tópicos
  const { 
    data: topics, 
    isLoading: topicsLoading, 
    error: topicsError 
  } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery,
    categories
  });

  // Mostrar erro se houver problema em ambas as consultas
  if (categoriesError && topicsError) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar a comunidade</h1>
          <p className="text-muted-foreground mb-6">Não foi possível carregar o conteúdo da comunidade. Por favor, tente novamente mais tarde.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Comunidade</h1>
          </div>
        </div>
        
        {/* Editor rápido */}
        <QuickPostInput />
        
        {/* Estatísticas */}
        <ForumStatistics 
          topicCount={topicCount} 
          postCount={postCount} 
          activeUserCount={activeUserCount}
          isLoading={statsLoading} 
        />
        
        {/* Barra de pesquisa e filtros */}
        <ForumSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        
        {/* Tabs por categorias e conteúdo */}
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CategoryTabs 
            categories={categories} 
            isLoading={categoriesLoading} 
          />
          
          <TabsContent value={activeTab} className="mt-4">
            {topicsLoading ? (
              <TopicsSkeleton />
            ) : topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <EmptyTopicsState searchQuery={searchQuery} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CommunityHome;
