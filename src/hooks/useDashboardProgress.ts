
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useDashboardProgress = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  
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
        setSolutions(mockSolutions);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [profile?.id, toast]);

  // Calculate statistics for progress overview
  const completedCount = userProgress.filter(p => p.is_completed).length;
  const inProgressCount = userProgress.filter(p => !p.is_completed).length;
  const progressPercentage = solutions.length > 0 
    ? Math.round((completedCount / solutions.length) * 100) 
    : 0;

  return {
    loading,
    solutions,
    userProgress,
    completedCount,
    inProgressCount,
    progressPercentage
  };
};
