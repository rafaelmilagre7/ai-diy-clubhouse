
import { Solution } from "@/lib/supabase";

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
