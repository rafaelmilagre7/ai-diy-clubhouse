import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreVertical,
  Plus,
  FileEdit,
  Copy,
  Eye,
  Trash2,
  BarChart,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolutionCategory, categoryMapping } from "@/lib/types/categoryTypes";

const categoryLabel = (category: string) => {
  switch (category) {
    case "Receita":
      return "Receita";
    case "Operacional":
      return "Operacional";
    case "Estratégia":
      return "Estratégia";
    // Compatibilidade com valores antigos (caso ainda existam no sistema)
    case "revenue":
      return "Receita";
    case "operational":
      return "Operacional";
    case "strategy":
      return "Estratégia";
    default:
      return category;
  }
};

const difficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Normal";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const SolutionsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Função para obter classe CSS com base na categoria
  const getCategoryClass = (category: SolutionCategory) => {
    // Usar getCategoryStyleKey para obter a chave correspondente
    const styleKey = getCategoryStyleKey(category);
    
    return cn(
      styleKey === "Receita" && "bg-revenue/10 text-revenue border-revenue/30",
      styleKey === "Operacional" && "bg-operational/10 text-operational border-operational/30",
      styleKey === "Estratégia" && "bg-strategy/10 text-strategy border-strategy/30"
    );
  };
  
  // Função para obter a chave de estilo correspondente à categoria
  const getCategoryStyleKey = (category: SolutionCategory): string => {
    return String(category);
  };

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .order("updated_at", { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setSolutions(data as Solution[]);
        setFilteredSolutions(data as Solution[]);
      } catch (error) {
        console.error("Error fetching solutions:", error);
        toast({
          title: "Erro ao carregar soluções",
          description: "Ocorreu um erro ao tentar carregar a lista de soluções.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, [toast]);
  
  useEffect(() => {
    let filtered = [...solutions];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (solution) =>
          solution.title.toLowerCase().includes(query) ||
          solution.description.toLowerCase().includes(query) ||
          solution.category.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(solution => solution.category === categoryFilter);
    }
    
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(solution => solution.difficulty === difficultyFilter);
    }
    
    if (statusFilter !== "all") {
      const isPublished = statusFilter === "published";
      filtered = filtered.filter(solution => solution.published === isPublished);
    }
    
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case "title":
          valueA = a.title;
          valueB = b.title;
          break;
        case "created_at":
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        case "updated_at":
        default:
          valueA = new Date(a.updated_at).getTime();
          valueB = new Date(b.updated_at).getTime();
          break;
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredSolutions(filtered);
  }, [searchQuery, solutions, categoryFilter, difficultyFilter, statusFilter, sortBy, sortOrder]);
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta solução? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("solutions")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      setSolutions(solutions.filter((solution) => solution.id !== id));
      toast({
        title: "Solução excluída",
        description: "A solução foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast({
        title: "Erro ao excluir solução",
        description: "Ocorreu um erro ao tentar excluir a solução.",
        variant: "destructive",
      });
    }
  };
  
  const handleTogglePublish = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("solutions")
        .update({ published: !currentState })
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      setSolutions(
        solutions.map((solution) =>
          solution.id === id
            ? { ...solution, published: !currentState }
            : solution
        )
      );
      
      toast({
        title: currentState ? "Solução despublicada" : "Solução publicada",
        description: currentState
          ? "A solução foi removida da lista pública."
          : "A solução está agora disponível para os membros.",
      });
    } catch (error) {
      console.error("Error updating solution:", error);
      toast({
        title: "Erro ao atualizar solução",
        description: "Ocorreu um erro ao tentar atualizar o status da solução.",
        variant: "destructive",
      });
    }
  };
  
  const duplicateSolution = async (solution: Solution) => {
    try {
      const { id, ...solutionData } = solution;
      
      const duplicateData = {
        ...solutionData,
        title: `${solution.title} (Cópia)`,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from("solutions")
        .insert(duplicateData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setSolutions([data as Solution, ...solutions]);
      
      toast({
        title: "Solução duplicada",
        description: "Uma cópia da solução foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Error duplicating solution:", error);
      toast({
        title: "Erro ao duplicar solução",
        description: "Ocorreu um erro ao tentar duplicar a solução.",
        variant: "destructive",
      });
    }
  };
  
  const viewMetrics = (solutionId: string) => {
    navigate(`/admin/analytics/solution/${solutionId}`);
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Soluções</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as soluções disponíveis na plataforma
          </p>
        </div>
        <Button onClick={() => navigate("/admin/solutions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solução
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar soluções..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant={showFilters ? "default" : "outline"} 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros {showFilters ? "(Ativos)" : ""}
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Estratégia">Estratégia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Dificuldade</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas dificuldades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas dificuldades</SelectItem>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Normal</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Ordenar por</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Última atualização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Última atualização</SelectItem>
                      <SelectItem value="created_at">Data de criação</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    title={sortOrder === "asc" ? "Crescente" : "Decrescente"}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSolutions.length > 0 ? (
              filteredSolutions.map((solution) => (
                <TableRow key={solution.id}>
                  <TableCell className="font-medium">{solution.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getCategoryClass(solution.category)}
                    >
                      {categoryLabel(solution.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {solution.difficulty === "easy" ? "Fácil" : 
                     solution.difficulty === "medium" ? "Normal" : 
                     solution.difficulty === "advanced" ? "Avançado" : solution.difficulty}
                  </TableCell>
                  <TableCell>
                    {solution.published ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <Check className="mr-1 h-3 w-3" />
                        Publicada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        <X className="mr-1 h-3 w-3" />
                        Rascunho
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(solution.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/admin/solutions/${solution.id}`}>
                          <DropdownMenuItem>
                            <FileEdit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link to={`/solution/${solution.id}`} target="_blank">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Ver como membro</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => duplicateSolution(solution)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewMetrics(solution.id)}>
                          <BarChart className="mr-2 h-4 w-4" />
                          <span>Ver métricas</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(solution.id, solution.published)}>
                          {solution.published ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              <span>Despublicar</span>
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              <span>Publicar</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(solution.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <FileEdit className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all" || statusFilter !== "all"
                        ? "Tente mudar os filtros para encontrar outras soluções."
                        : "Comece criando sua primeira solução!"}
                    </p>
                    {!searchQuery && categoryFilter === "all" && difficultyFilter === "all" && statusFilter === "all" && (
                      <Button 
                        className="mt-4"
                        onClick={() => navigate("/admin/solutions/new")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Solução
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SolutionsList;
