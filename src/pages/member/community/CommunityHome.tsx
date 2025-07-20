
import React, { useState } from "react";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumStatistics } from "@/components/community/ForumStatistics";
import { CategoryList } from "@/components/community/CategoryList";
import { TopicList } from "@/components/community/TopicList";
import { SearchAndFilters } from "@/components/community/SearchAndFilters";
import { CreateTopicDialog } from "@/components/community/CreateTopicDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useForumTopics } from "@/hooks/useForumTopics";

export const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);

  const { topics, isLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  return (
    <ForumLayout
      sidebar={
        <div className="space-y-4">
          <Button 
            onClick={() => setIsCreateTopicOpen(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
          <CategoryList />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comunidade</h1>
            <p className="text-muted-foreground mt-1">
              Conecte-se, aprenda e compartilhe conhecimento
            </p>
          </div>
        </div>

        <ForumStatistics />

        <SearchAndFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <TopicList 
          topics={topics || []} 
          isLoading={isLoading}
        />

        <CreateTopicDialog
          open={isCreateTopicOpen}
          onOpenChange={setIsCreateTopicOpen}
        />
      </div>
    </ForumLayout>
  );
};
