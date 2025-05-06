
import { Solution } from "@/lib/supabase";

// Fallback solutions data for when API calls fail
export const fallbackSolutionsData: Solution[] = [
  {
    id: "1",
    title: "Assistente de IA no WhatsApp",
    description: "Implemente um assistente de IA para atendimento automatizado via WhatsApp",
    thumbnail_url: "/images/whatsapp-ai.jpg", // Certifique-se que não é null
    category: "operational",
    difficulty: "easy",
    slug: "whatsapp-ai-assistant",
    estimated_time: 45,
    success_rate: 95,
    tags: ["whatsapp", "automation", "ai"],
    related_solutions: [],
    published: true,
    author_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    checklist_items: [],
    implementation_steps: [],
    completion_requirements: {}
  },
  {
    id: "2",
    title: "Chatbot para Geração de Leads",
    description: "Crie um chatbot para qualificar e capturar leads no seu site",
    thumbnail_url: "/images/chatbot-leads.jpg", // Certifique-se que não é null
    category: "revenue",
    difficulty: "medium",
    slug: "chatbot-lead-generation",
    estimated_time: 60,
    success_rate: 80,
    tags: ["chatbot", "lead generation", "sales"],
    related_solutions: [],
    published: true,
    author_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    checklist_items: [],
    implementation_steps: [],
    completion_requirements: {}
  },
  {
    id: "3",
    title: "Análise de Sentimento de Clientes",
    description: "Analise o sentimento dos seus clientes para melhorar a satisfação e retenção",
    thumbnail_url: "/images/sentiment-analysis.jpg", // Certifique-se que não é null
    category: "operational",
    difficulty: "advanced",
    slug: "customer-sentiment-analysis",
    estimated_time: 90,
    success_rate: 70,
    tags: ["sentiment analysis", "customer satisfaction", "retention"],
    related_solutions: [],
    published: true,
    author_id: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    checklist_items: [],
    implementation_steps: [],
    completion_requirements: {}
  }
];

// Function to sort solutions by difficulty
export const sortSolutionsByDifficulty = (solutions: Solution[]): Solution[] => {
  return [...solutions].sort((a, b) => {
    // Sort by difficulty
    const difficultyOrder = { "easy": 0, "medium": 1, "advanced": 2 };
    const diffA = a.difficulty as "easy" | "medium" | "advanced";
    const diffB = b.difficulty as "easy" | "medium" | "advanced";
    return difficultyOrder[diffA] - difficultyOrder[diffB];
  });
};

// Process progress data into separate solution lists
export const processSolutionsData = (
  solutions: Solution[], 
  progressData: any[]
) => {
  const userProgress: {[key: string]: any} = {};
  const activeSolutionsIds: string[] = [];
  const completedSolutionsIds: string[] = [];
  
  if (progressData && progressData.length > 0) {
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
  const activeSolutions = solutions.filter(solution => 
    activeSolutionsIds.includes(solution.id)
  );
  
  const completedSolutions = solutions.filter(solution => 
    completedSolutionsIds.includes(solution.id)
  );
  
  // Get available solutions (excluding active and completed)
  const availableSolutions = solutions.filter(solution => 
    !activeSolutionsIds.includes(solution.id) && 
    !completedSolutionsIds.includes(solution.id)
  );
  
  return {
    userProgress,
    activeSolutions,
    completedSolutions,
    availableSolutions
  };
};
