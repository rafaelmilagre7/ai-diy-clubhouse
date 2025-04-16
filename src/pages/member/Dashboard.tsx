
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";

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
        
        // Verificar se os dados retornados são do tipo Solution
        if (solutionsData && solutionsData.length > 0) {
          // Validar e converter as categorias para garantir que atendam ao tipo Solution
          const validatedSolutions = solutionsData.map(solution => {
            // Garantir que category é um dos valores válidos
            let validCategory: 'revenue' | 'operational' | 'strategy' = 'revenue';
            
            if (
              solution.category === 'revenue' || 
              solution.category === 'operational' || 
              solution.category === 'strategy'
            ) {
              validCategory = solution.category as 'revenue' | 'operational' | 'strategy';
            } else {
              // Log para debug caso ocorra uma categoria inválida
              console.warn(`Categoria inválida encontrada: ${solution.category}, usando 'revenue' como padrão`);
            }
            
            return {
              ...solution,
              category: validCategory
            } as Solution;
          });
          
          setSolutions(validatedSolutions);
        } else {
          setSolutions([]);
        }
        
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
        
        // Em caso de erro, inicializar com um array vazio
        setSolutions([]);
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
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section with header */}
      <DashboardHeader 
        profileName={profile?.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Progress summary cards */}
      <ProgressSummary 
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        progressPercentage={progressPercentage}
        totalSolutions={solutions.length}
      />
      
      {/* Category tabs and solutions grid */}
      <div className="space-y-4">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          filteredSolutions={filteredSolutions}
          onSelectSolution={handleSelectSolution}
        />
      </div>
    </div>
  );
};

export default Dashboard;
