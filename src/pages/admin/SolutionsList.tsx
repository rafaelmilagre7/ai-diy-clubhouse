
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Convert category to Portuguese
const categoryLabel = (category: string) => {
  switch (category) {
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

// Convert difficulty to Portuguese
const difficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

// Format minutes to time
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

// Format date for display
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
  
  // Filter solutions when search changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSolutions(solutions);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = solutions.filter(
      (solution) =>
        solution.title.toLowerCase().includes(query) ||
        solution.description.toLowerCase().includes(query) ||
        solution.category.toLowerCase().includes(query)
    );
    
    setFilteredSolutions(filtered);
  }, [searchQuery, solutions]);
  
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
      
      // Update the state to remove the deleted solution
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
      
      // Update the state to reflect the change
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
      const { data, error } = await supabase
        .from("solutions")
        .insert({
          ...solution,
          id: undefined, // Let Supabase generate a new ID
          title: `${solution.title} (Cópia)`,
          published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Tempo</TableHead>
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
                      className={cn(
                        solution.category === "revenue" && "bg-revenue/10 text-revenue border-revenue/30",
                        solution.category === "operational" && "bg-operational/10 text-operational border-operational/30",
                        solution.category === "strategy" && "bg-strategy/10 text-strategy border-strategy/30"
                      )}
                    >
                      {categoryLabel(solution.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>{difficultyLabel(solution.difficulty)}</TableCell>
                  <TableCell>{formatTime(solution.estimated_time)}</TableCell>
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
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <FileEdit className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery
                        ? "Tente mudar a busca para encontrar outras soluções."
                        : "Comece criando sua primeira solução!"}
                    </p>
                    {!searchQuery && (
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
