
import { useState } from "react";
import { CommunityNavigation } from "@/components/community/CommunityNavigation";
import { ForumBreadcrumbs } from "@/components/community/ForumBreadcrumbs";
import { TopicCard } from "@/components/community/TopicCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedFilter, setSelectedFilter] = useState<"recentes" | "populares" | "sem-respostas" | "resolvidos">("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar categorias
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      console.log("📂 Buscando categorias do fórum...");
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar categorias:", error);
        throw error;
      }
      
      console.log("✅ Categorias carregadas:", data?.length || 0);
      return data || [];
    },
    retry: 2
  });

  // Buscar tópicos com filtros
  const { 
    data: topics = [], 
    isLoading: topicsLoading, 
    error: topicsError,
    refetch: refetchTopics 
  } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery,
    categories
  });

  const handleTabChange = (tab: string) => {
    console.log("🔄 Mudando aba para:", tab);
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    console.log("🔄 Atualizando tópicos...");
    refetchTopics();
  };

  const isLoading = categoriesLoading || topicsLoading;
  const hasError = categoriesError || topicsError;

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Comunidade</h1>
          <p className="text-muted-foreground mt-1">
            Conecte-se, compartilhe conhecimento e tire dúvidas com outros membros
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/comunidade/novo-topico">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tópico
            </Link>
          </Button>
        </div>
      </div>

      <CommunityNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        categories={categories}
      />

      {/* Debug info para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Categorias: {categories.length} | Tópicos: {topics.length} | 
          Filtro: {selectedFilter} | Aba: {activeTab} | Busca: {searchQuery || 'nenhuma'}
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais Recentes</SelectItem>
            <SelectItem value="populares">Mais Populares</SelectItem>
            <SelectItem value="sem-respostas">Sem Respostas</SelectItem>
            <SelectItem value="resolvidos">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tratamento de erro */}
      {hasError && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ocorreu um erro ao carregar os dados da comunidade. 
            <Button variant="link" onClick={handleRefresh} className="p-0 ml-1 h-auto">
              Tente novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Tópicos */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'Nenhum tópico encontrado' : 'Ainda não há tópicos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Tente ajustar sua pesquisa ou limpar os filtros.'
                  : 'Seja o primeiro a iniciar uma discussão na comunidade!'
                }
              </p>
              {searchQuery ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Limpar busca
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/comunidade/novo-topico">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro tópico
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
