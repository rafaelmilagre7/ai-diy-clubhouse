
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { CommunityHero } from "@/components/community/CommunityHero";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { CategoryTabsModern } from "@/components/community/CategoryTabsModern";
import { CommunitySidebarModern } from "@/components/community/CommunitySidebarModern";
import { UnifiedTopicListModern } from "@/components/community/UnifiedTopicListModern";
import { useCommunityCategories } from "@/hooks/community/useCommunityCategories";
import { useCommunityTopics } from "@/hooks/community/useCommunityTopics";
import { CommunityFilterType } from "@/types/communityTypes";

export default function CommunityHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CommunityFilterType>("recentes");
  const [activeTab, setActiveTab] = useState("todos");

  const { categories, isLoading: categoriesLoading } = useCommunityCategories();
  
  const { topics, isLoading, error, refetch } = useCommunityTopics({
    activeTab: "all",
    selectedFilter,
    searchQuery,
    categorySlug: activeTab
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <CommunityLayout>
          {/* Hero Section */}
          <CommunityHero 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-8">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Modern Category Navigation */}
                <CategoryTabsModern 
                  categories={categories} 
                  isLoading={categoriesLoading} 
                />

                {/* Enhanced Filters */}
                <div className="mt-6">
                  <CommunityFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                  />
                </div>

                {/* Topics Content */}
                <div className="mt-8">
                  <TabsContent value="todos" className="mt-0">
                    <UnifiedTopicListModern
                      topics={topics}
                      isLoading={isLoading}
                      error={error}
                      refetch={refetch}
                      searchQuery={searchQuery}
                      showPinned={true}
                    />
                  </TabsContent>

                  {categories?.map((category) => (
                    <TabsContent key={category.slug} value={category.slug} className="mt-0">
                      <UnifiedTopicListModern
                        topics={topics}
                        isLoading={isLoading}
                        error={error}
                        refetch={refetch}
                        searchQuery={searchQuery}
                        showPinned={true}
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>

            {/* Modern Sidebar */}
            <div className="xl:col-span-1">
              <CommunitySidebarModern />
            </div>
          </div>
        </CommunityLayout>
      </div>
    </div>
  );
}
