
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { UnifiedTopicList } from "@/components/community/UnifiedTopicList";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { CommunityFilterType } from "@/types/communityTypes";

export default function CommunityHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CommunityFilterType>("recentes");
  const [activeTab, setActiveTab] = useState("todos");

  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
  const { topics, isLoading, error, refetch } = useForumTopics({
    activeTab: "all",
    selectedFilter,
    searchQuery,
    categorySlug: activeTab
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Comunidade VIVER DE IA
          </h1>
          <p className="text-muted-foreground">
            Conecte-se, compartilhe conhecimento e tire suas dúvidas sobre IA
          </p>
        </div>

        {/* Stats */}
        <CommunityStats />

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs de Categoria */}
              <CategoryTabs categories={categories} isLoading={categoriesLoading} />

              {/* Filtros de Busca */}
              <CommunityFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />

              {/* Conteúdo das Tabs */}
              <TabsContent value="todos" className="mt-6">
                <UnifiedTopicList
                  topics={topics}
                  isLoading={isLoading}
                  error={error}
                  refetch={refetch}
                  searchQuery={searchQuery}
                  showPinned={true}
                />
              </TabsContent>

              {categories?.map((category) => (
                <TabsContent key={category.slug} value={category.slug} className="mt-6">
                  <UnifiedTopicList
                    topics={topics}
                    isLoading={isLoading}
                    error={error}
                    refetch={refetch}
                    searchQuery={searchQuery}
                    showPinned={true}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
