import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";

// Dummy data for when API calls fail
const fallbackSolutionsData: Solution[] = [
  {
    id: "1",
    title: "Assistente de IA no WhatsApp",
    description: "Implemente um assistente de IA para atendimento automatizado via WhatsApp",
    thumbnail_url: "/images/whatsapp-ai.jpg",
    category: "operational",
    difficulty: "easy",
    slug: "whatsapp-ai-assistant",
    estimated_time: 45,
    success_rate: 95,
    tags: ["whatsapp", "automation", "ai"],
    related_solutions: [],
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Chatbot para Geração de Leads",
    description: "Crie um chatbot para qualificar e capturar leads no seu site",
    thumbnail_url: "/images/chatbot-leads.jpg",
    category: "revenue",
    difficulty: "medium",
    slug: "chatbot-lead-generation",
    estimated_time: 60,
    success_rate: 80,
    tags: ["chatbot", "lead generation", "sales"],
    related_solutions: [],
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Análise de Sentimento de Clientes",
    description: "Analise o sentimento dos seus clientes para melhorar a satisfação e retenção",
    thumbnail_url: "/images/sentiment-analysis.jpg",
    category: "operational",
    difficulty: "advanced",
    slug: "customer-sentiment-analysis",
    estimated_time: 90,
    success_rate: 70,
    tags: ["sentiment analysis", "customer satisfaction", "retention"],
    related_solutions: [],
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface UserProgress {
  solutionId: string;
  currentModule: number;
  isCompleted: boolean;
  completionDate: string | null;
  lastActivity: string;
}

export interface Dashboard {
  activeSolutions: Solution[];
  completedSolutions: Solution[];
  recommendedSolutions: Solution[];
  allSolutions: Solution[];
  userProgress: {[key: string]: UserProgress};
  loading: boolean;
}

export const useDashboardProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<Dashboard>({
    activeSolutions: [],
    completedSolutions: [],
    recommendedSolutions: [],
    allSolutions: [],
    userProgress: {},
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setDashboard(prev => ({ ...prev, loading: true }));
        
        // Fetch all published solutions
        const { data: solutions, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        if (solutionsError) {
          console.error("Error fetching solutions:", solutionsError);
          toast({
            title: "Erro ao carregar soluções",
            description: "Não foi possível carregar a lista de soluções disponíveis.",
            variant: "destructive",
          });
          
          // Use fallback data
          setDashboard(prev => ({
            ...prev,
            allSolutions: fallbackSolutionsData,
            recommendedSolutions: fallbackSolutionsData.slice(0, 3),
            loading: false
          }));
          return;
        }
        
        // Ensure solutions array is type-safe
        const typedSolutions = solutions as Solution[];
        
        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);
        
        if (progressError) {
          console.error("Error fetching user progress:", progressError);
          toast({
            title: "Erro ao carregar progresso",
            description: "Não foi possível carregar seu progresso nas soluções.",
            variant: "destructive",
          });
        }
        
        // Process user progress
        const userProgress: {[key: string]: UserProgress} = {};
        const activeSolutionsIds: string[] = [];
        const completedSolutionsIds: string[] = [];
        
        if (progressData) {
          progressData.forEach(item => {
            userProgress[item.solution_id] = {
              solutionId: item.solution_id,
              currentModule: item.current_module,
              isCompleted: item.is_completed,
              completionDate: item.completion_date,
              lastActivity: item.last_activity
            };
            
            if (item.is_completed) {
              completedSolutionsIds.push(item.solution_id);
            } else {
              activeSolutionsIds.push(item.solution_id);
            }
          });
        }
        
        // Filter solutions based on user progress
        const activeSolutions = typedSolutions.filter(solution => 
          activeSolutionsIds.includes(solution.id)
        );
        
        const completedSolutions = typedSolutions.filter(solution => 
          completedSolutionsIds.includes(solution.id)
        );
        
        // Get recommended solutions (excluding active and completed)
        const availableSolutions = typedSolutions.filter(solution => 
          !activeSolutionsIds.includes(solution.id) && 
          !completedSolutionsIds.includes(solution.id)
        );
        
        // Simple recommendation algorithm: prioritize easier solutions
        const recommendedSolutions = [...availableSolutions]
          .sort((a, b) => {
            // Sort by difficulty
            const difficultyOrder = { "easy": 0, "medium": 1, "advanced": 2 };
            return difficultyOrder[a.difficulty as "easy" | "medium" | "advanced"] - 
                   difficultyOrder[b.difficulty as "easy" | "medium" | "advanced"];
          })
          .slice(0, 3); // Get top 3
        
        // Update dashboard state
        setDashboard({
          activeSolutions,
          completedSolutions,
          recommendedSolutions,
          allSolutions: typedSolutions,
          userProgress,
          loading: false
        });
        
      } catch (error) {
        console.error("Error in dashboard data fetching:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
          variant: "destructive",
        });
        
        // Use fallback data
        setDashboard(prev => ({
          ...prev,
          allSolutions: fallbackSolutionsData,
          recommendedSolutions: fallbackSolutionsData.slice(0, 3),
          loading: false
        }));
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);
  
  return dashboard;
};
