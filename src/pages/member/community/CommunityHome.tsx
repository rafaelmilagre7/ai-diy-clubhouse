
import React, { useState } from "react";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumStatistics } from "@/components/community/ForumStatistics";
import { CategoryList } from "@/components/community/CategoryList";
import { ForumSearch } from "@/components/community/ForumSearch";
import { CreateTopicDialog } from "@/components/community/CreateTopicDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useForumTopics } from "@/hooks/community/useForumTopics";

export const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"recentes" | "populares" | "sem-respostas" | "resolvidos">("recentes");
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

        <ForumSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-2">Carregando tópicos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics && topics.length > 0 ? (
                topics.map((topic: any) => (
                  <div key={topic.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <h3 className="font-medium text-lg">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{topic.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Por {topic.profiles?.name || 'Usuário'}</span>
                      <span>{topic.reply_count || 0} respostas</span>
                      <span>{topic.view_count || 0} visualizações</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum tópico encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>

        <CreateTopicDialog
          open={isCreateTopicOpen}
          onOpenChange={setIsCreateTopicOpen}
        />
      </div>
    </ForumLayout>
  );
};

export default CommunityHome;
