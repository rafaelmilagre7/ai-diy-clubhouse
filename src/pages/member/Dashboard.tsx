
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useState, useEffect } from "react";
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
        
        // Define mock data for fallback in case of errors
        const mockSolutions: Solution[] = [
          {
            id: "1",
            title: "Assistente de IA no WhatsApp",
            description: "Implemente um assistente de IA para atendimento via WhatsApp, automatizando respostas e melhorando o tempo de resposta.",
            slug: "assistente-whatsapp",
            category: "operational",
            difficulty: "easy",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "2",
            title: "Análise Preditiva de Vendas",
            description: "Use IA para prever tendências de vendas e otimizar seu estoque e estratégias de marketing.",
            slug: "analise-preditiva-vendas",
            category: "revenue",
            difficulty: "advanced",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "3",
            title: "Assistente de IA para Gestão de Projetos",
            description: "Automatize seu fluxo de gestão de projetos com IA para aumentar a eficiência e reduzir atrasos.",
            slug: "assistente-gestao-projetos",
            category: "strategy",
            difficulty: "medium",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        try {
          // Fetch published solutions
          const { data: solutionsData, error: solutionsError } = await supabase
            .from("solutions")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });
          
          if (solutionsError) {
            console.warn("Error fetching solutions:", solutionsError);
            setSolutions(mockSolutions);
          } else if (solutionsData && solutionsData.length > 0) {
            // Validate and convert categories
            const validatedSolutions = solutionsData.map(solution => {
              let validCategory: 'revenue' | 'operational' | 'strategy' = 'revenue';
              
              if (
                solution.category === 'revenue' || 
                solution.category === 'operational' || 
                solution.category === 'strategy'
              ) {
                validCategory = solution.category as 'revenue' | 'operational' | 'strategy';
              }
              
              return {
                ...solution,
                category: validCategory
              } as Solution;
            });
            
            setSolutions(validatedSolutions);
          } else {
            console.log("No solutions found, using mock data");
            setSolutions(mockSolutions);
          }
        } catch (error) {
          console.error("Error in solutions fetch:", error);
          setSolutions(mockSolutions);
        }
        
        try {
          // Fetch user progress
          if (profile?.id) {
            const { data: progressData, error: progressError } = await supabase
              .from("progress")
              .select("*")
              .eq("user_id", profile.id);
            
            if (progressError) {
              console.error("Error fetching progress:", progressError);
              setUserProgress([]);
            } else {
              setUserProgress(progressData || []);
            }
          }
        } catch (error) {
          console.error("Error in progress fetch:", error);
          setUserProgress([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Estamos usando dados de demonstração enquanto resolvemos o problema.",
          variant: "destructive",
        });
        
        // Fallback to mock data
        setSolutions([
          {
            id: "1",
            title: "Assistente de IA no WhatsApp",
            description: "Implemente um assistente de IA para atendimento via WhatsApp, automatizando respostas e melhorando o tempo de resposta.",
            slug: "assistente-whatsapp",
            category: "operational",
            difficulty: "easy",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "2",
            title: "Análise Preditiva de Vendas",
            description: "Use IA para prever tendências de vendas e otimizar seu estoque e estratégias de marketing.",
            slug: "analise-preditiva-vendas",
            category: "revenue",
            difficulty: "advanced",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "3",
            title: "Assistente de IA para Gestão de Projetos",
            description: "Automatize seu fluxo de gestão de projetos com IA para aumentar a eficiência e reduzir atrasos.",
            slug: "assistente-gestao-projetos",
            category: "strategy",
            difficulty: "medium",
            thumbnail_url: null,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
    console.log("Navigating to solution detail:", id);
    navigate(`/solution/${id}`);
  };
  
  if (loading) {
    return <LoadingScreen message="Carregando suas soluções..." />;
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
