
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, BarChart, ArrowRight, Filter } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Helper function to shorten text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Helper function to format minutes to time
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

// Difficulty badge component
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const getColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLabel = () => {
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

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        getColor()
      )}
    >
      {getLabel()}
    </span>
  );
};

// Solution Card component
const SolutionCard = ({ solution, onSelect }: { solution: Solution; onSelect: (id: string) => void }) => {
  return (
    <Card className={cn("solution-card transition-all duration-200 cursor-pointer hover:translate-y-[-4px]", solution.category)}>
      <CardContent className="p-0">
        <div 
          className="h-40 bg-cover bg-center rounded-t-xl"
          style={{ 
            backgroundImage: solution.thumbnail_url 
              ? `url(${solution.thumbnail_url})` 
              : `url('https://placehold.co/600x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
          }}
        />
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={cn("badge-" + solution.category)}>
              {solution.category === "revenue" && "Receita"}
              {solution.category === "operational" && "Operacional"}
              {solution.category === "strategy" && "Estratégia"}
            </Badge>
            <DifficultyBadge difficulty={solution.difficulty} />
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">{solution.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {solution.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{formatTime(solution.estimated_time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground flex items-center">
            <BarChart className="mr-1 h-4 w-4" />
            <span>{solution.success_rate}% sucesso</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onSelect(solution.id)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || "all");
  
  // Fetch solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setSolutions(data as Solution[]);
        setFilteredSolutions(data as Solution[]);
      } catch (error) {
        console.error("Error fetching solutions:", error);
        toast({
          title: "Erro ao carregar soluções",
          description: "Ocorreu um erro ao tentar carregar as soluções disponíveis.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, [toast]);
  
  // Filter solutions when category or search changes
  useEffect(() => {
    let filtered = [...solutions];
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((solution) => solution.category === activeCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (solution) =>
          solution.title.toLowerCase().includes(query) ||
          solution.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery, solutions]);
  
  // Update active category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const handleSelectSolution = (id: string) => {
    navigate(`/solution/${id}`);
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(" ")[0] || "Membro"}!</h1>
          <p className="text-muted-foreground mt-1">
            Escolha uma solução de IA para implementar em sua empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar soluções..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Category tabs */}
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="revenue" className="text-revenue">Receita</TabsTrigger>
          <TabsTrigger value="operational" className="text-operational">Operacional</TabsTrigger>
          <TabsTrigger value="strategy" className="text-strategy">Estratégia</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {filteredSolutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolutions.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  onSelect={handleSelectSolution}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
              <p className="text-muted-foreground mt-1">
                Tente mudar os filtros ou a busca para encontrar outras soluções
              </p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;
