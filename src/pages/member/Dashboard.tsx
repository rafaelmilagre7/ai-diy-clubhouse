
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase, Solution } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Search, CheckCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  
  const solutionCategories = [
    { id: "all", name: "Todas as Soluções" },
    { id: "revenue", name: "Aumento de Receita" },
    { id: "operational", name: "Otimização Operacional" },
    { id: "strategy", name: "Gestão Estratégica" }
  ];
  
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  
  // Fetch solutions and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch published solutions
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        
        if (solutionsError) {
          throw solutionsError;
        }
        
        setSolutions(solutionsData || []);
        
        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", profile?.id || '');
        
        if (progressError) {
          console.error("Error fetching progress:", progressError);
        } else {
          setUserProgress(progressData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as soluções. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id, toast]);
  
  // Filter solutions by category and search
  useEffect(() => {
    let filtered = [...solutions];
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(solution => solution.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        solution => 
          solution.title.toLowerCase().includes(query) || 
          solution.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery, solutions]);
  
  // Calculate statistics for progress overview
  const completedCount = userProgress.filter(p => p.is_completed).length;
  const inProgressCount = userProgress.filter(p => !p.is_completed).length;
  const progressPercentage = solutions.length > 0 
    ? Math.round((completedCount / solutions.length) * 100) 
    : 0;
  
  const handleSelectSolution = (id: string) => {
    navigate(`/dashboard/solution/${id}`);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Iniciante";
      case "medium":
        return "Intermediário";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(' ')[0] || "Membro"}!</h1>
          <p className="text-muted-foreground mt-1">
            Escolha uma solução para implementar na sua empresa
          </p>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar soluções..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Progress summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <CheckCircle className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementações Completas</p>
                <p className="text-2xl font-bold">{completedCount} de {solutions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <Clock className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{inProgressCount} soluções</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <TrendingUp className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seu Progresso</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category tabs */}
      <div className="space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            {solutionCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-6">
            {filteredSolutions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map((solution) => {
                  const progress = userProgress.find(p => p.solution_id === solution.id);
                  return (
                    <Card key={solution.id} className="overflow-hidden transition-shadow hover:shadow-md">
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={solution.thumbnail_url || "https://images.unsplash.com/photo-1677442135136-760c813098b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWklMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D"} 
                          alt={solution.title} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={getDifficultyColor(solution.difficulty)}>
                            {getDifficultyLabel(solution.difficulty)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{solution.estimated_time || 30} min</span>
                          </div>
                        </div>
                        <CardTitle className="mt-2 line-clamp-1">{solution.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {solution.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          onClick={() => handleSelectSolution(solution.id)}
                          className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                        >
                          {progress?.is_completed ? 'Ver Detalhes' : (progress ? 'Continuar' : 'Implementar')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">Nenhuma solução encontrada</p>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros ou busca
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
