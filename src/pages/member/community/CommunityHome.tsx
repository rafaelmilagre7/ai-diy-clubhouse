import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { TopicItem } from "@/components/community/TopicItem";
import { Skeleton } from "@/components/ui/skeleton";
import { ForumHeader } from "@/components/community/ForumHeader";
import { ForumBreadcrumbs } from "@/components/community/ForumBreadcrumbs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTopicDialog } from "@/components/community/CreateTopicDialog";
import { useReporting } from "@/hooks/community/useReporting";
import { ReportModal } from "@/components/community/ReportModal";

export default function CommunityHome() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  
  // Buscar categorias
  const { categories, isLoading: loadingCategories } = useForumCategories();
  
  // Buscar tópicos com base nos filtros
  const { data: topics, isLoading: loadingTopics } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery,
    categories
  });

  // Opções do filtro
  const filterOptions = [
    { value: "recentes", label: "Mais Recentes" },
    { value: "populares", label: "Mais Populares" },
    { value: "sem-respostas", label: "Sem Respostas" },
    { value: "resolvidos", label: "Resolvidos" }
  ];

  // Obter o ID da categoria a partir do slug
  const getDefaultCategoryId = () => {
    if (activeTab !== "todos") {
      const category = categories?.find(cat => cat.slug === activeTab);
      if (category) return category.id;
    }
    return categories && categories.length > 0 ? categories[0].id : "";
  };

  const { 
    isReportModalOpen, 
    closeReportModal, 
    submitReport 
  } = useReporting();

  const handleNewTopicClick = () => {
    setCreateTopicOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <ForumBreadcrumbs categorySlug={activeTab !== "todos" ? activeTab : undefined} />
      
      <ForumHeader 
        showNewTopicButton={true}
        onNewTopicClick={handleNewTopicClick}
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Pesquisar tópicos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1.5">
              <Filter className="h-4 w-4" />
              <span>
                {filterOptions.find(option => option.value === selectedFilter)?.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={selectedFilter}
              onValueChange={(value) => setSelectedFilter(value as TopicFilterType)}
            >
              {filterOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 w-full flex flex-wrap gap-1 sm:gap-0">
          <TabsTrigger value="todos" className="flex-1">
            Todos os tópicos
          </TabsTrigger>
          
          {loadingCategories ? (
            <>
              <TabsTrigger value="loading1" disabled className="flex-1">
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
              <TabsTrigger value="loading2" disabled className="flex-1">
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
            </>
          ) : (
            categories?.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.slug}
                className="flex-1"
              >
                {category.name}
              </TabsTrigger>
            ))
          )}
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loadingTopics ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-md mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
            ))
          ) : topics && topics.length > 0 ? (
            topics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-medium mb-2">Nenhum tópico encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Não encontramos resultados para sua busca." 
                  : "Ainda não há tópicos nesta categoria."}
              </p>
              <Button 
                onClick={handleNewTopicClick}
              >
                Criar o primeiro tópico
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CreateTopicDialog - centralizado aqui */}
      <CreateTopicDialog 
        open={createTopicOpen} 
        onOpenChange={setCreateTopicOpen}
        preselectedCategory={getDefaultCategoryId()}
        onTopicCreated={() => {
          setCreateTopicOpen(false);
          // Opcional: recarregar tópicos
        }}
      />

      {/* Report Modal */}
      <ReportModal
        open={isReportModalOpen}
        onOpenChange={closeReportModal}
        onSubmit={submitReport}
        targetType="topic"
      />
    </div>
  );
}
