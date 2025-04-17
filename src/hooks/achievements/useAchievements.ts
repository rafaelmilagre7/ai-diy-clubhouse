
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@/types/achievementTypes";
import { useAchievementData } from "./useAchievementData";
import {
  generateImplementationAchievements,
  generateCategoryAchievements,
  generateEngagementAchievements
} from "@/utils/achievements/achievementGenerators";

export const useAchievements = () => {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const {
    loading,
    error,
    progressData,
    solutions,
    checklistData,
    badgesData
  } = useAchievementData();

  useEffect(() => {
    if (loading || error) return;

    try {
      const implementationAchievements = generateImplementationAchievements(progressData, solutions);
      const categoryAchievements = generateCategoryAchievements(progressData, solutions);
      const engagementAchievements = generateEngagementAchievements(progressData, solutions);

      const allAchievements = [
        ...implementationAchievements,
        ...categoryAchievements,
        ...engagementAchievements
      ];

      setAchievements(allAchievements);

    } catch (error) {
      console.error("Error generating achievements:", error);
      toast({
        title: "Erro ao carregar conquistas",
        description: "Ocorreu um erro ao carregar suas conquistas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [loading, error, progressData, solutions, checklistData, badgesData, toast]);

  return {
    loading,
    error,
    achievements,
    userProgress: progressData,
    solutions
  };
};
