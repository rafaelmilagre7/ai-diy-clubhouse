
import { useMemo } from "react";
import { Solution } from "@/lib/supabase";

export interface SolutionStep {
  id: string;
  title: string;
  type: 'overview' | 'implementation' | 'checklist' | 'completion';
  order_index: number;
  content: any;
}

export const useSolutionSteps = (solution: Solution | null): SolutionStep[] => {
  return useMemo(() => {
    if (!solution) return [];
    
    const steps: SolutionStep[] = [];
    
    // 1. Overview Step - Informações da solução
    steps.push({
      id: `${solution.id}-overview`,
      title: "Visão Geral",
      type: "overview",
      order_index: 0,
      content: {
        title: solution.title,
        description: solution.description,
        overview: solution.overview,
        image_url: solution.image_url,
        estimated_time: solution.estimated_time?.toString() || "2-4 horas",
        difficulty: solution.difficulty || "Intermediário",
        learning_objectives: solution.learning_objectives || []
      }
    });
    
    // 2. Implementation Steps - Usar dados reais de implementation_steps
    if (solution.implementation_steps && Array.isArray(solution.implementation_steps)) {
      solution.implementation_steps.forEach((step: any, index: number) => {
        steps.push({
          id: `${solution.id}-step-${index}`,
          title: step.title || `Etapa ${index + 1}`,
          type: "implementation",
          order_index: index + 1,
          content: {
            title: step.title,
            description: step.description,
            instructions: step.instructions,
            tips: step.tips,
            resources: step.resources
          }
        });
      });
    }
    
    // 3. Checklist Step - Usar dados reais de checklist_items
    const checklistItems = solution.checklist_items || solution.checklist || [];
    if (checklistItems && Array.isArray(checklistItems) && checklistItems.length > 0) {
      steps.push({
        id: `${solution.id}-checklist`,
        title: "Verificação Final",
        type: "checklist",
        order_index: steps.length,
        content: {
          description: "Verifique se todos os itens foram implementados corretamente.",
          checklist: checklistItems
        }
      });
    }
    
    // 4. Completion Step
    steps.push({
      id: `${solution.id}-completion`,
      title: "Implementação Concluída",
      type: "completion",
      order_index: steps.length,
      content: {
        title: solution.title,
        completion_message: "Parabéns! Você implementou com sucesso esta solução de IA.",
        completion_requirements: solution.completion_requirements || [],
        next_steps: [
          "Monitore o desempenho da solução",
          "Colete feedback dos usuários",
          "Explore outras soluções disponíveis",
          "Compartilhe sua experiência na comunidade"
        ]
      }
    });
    
    return steps;
  }, [solution]);
};
