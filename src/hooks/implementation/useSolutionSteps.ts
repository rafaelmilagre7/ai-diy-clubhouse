
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
    if (!solution) {
      console.log('⚠️ Nenhuma solução fornecida para useSolutionSteps');
      return [];
    }
    
    console.log('🔄 Processando steps da solução:', solution.title);
    
    const steps: SolutionStep[] = [];
    
    // 1. Overview Step - Informações da solução
    steps.push({
      id: `${solution.id}-overview`,
      title: "Visão Geral",
      type: "overview",
      order_index: 0,
      content: {
        title: solution.title || 'Título não definido',
        description: solution.description || 'Descrição não disponível',
        overview: solution.overview || 'Visão geral não disponível',
        image_url: solution.image_url || null,
        estimated_time: solution.estimated_time?.toString() || "2-4 horas",
        difficulty: solution.difficulty || "Intermediário",
        learning_objectives: Array.isArray(solution.learning_objectives) ? solution.learning_objectives : []
      }
    });
    
    // 2. Implementation Steps - Tratar dados defensivamente
    const implementationSteps = solution.implementation_steps || [];
    
    if (Array.isArray(implementationSteps) && implementationSteps.length > 0) {
      implementationSteps.forEach((step: any, index: number) => {
        // Se for string, converter para objeto
        if (typeof step === 'string') {
          steps.push({
            id: `${solution.id}-step-${index}`,
            title: `Etapa ${index + 1}`,
            type: "implementation",
            order_index: index + 1,
            content: {
              title: `Etapa ${index + 1}`,
              description: step,
              instructions: step,
              tips: [],
              resources: []
            }
          });
        } else if (step && typeof step === 'object') {
          // Se for objeto, usar estrutura existente
          steps.push({
            id: `${solution.id}-step-${index}`,
            title: step.title || `Etapa ${index + 1}`,
            type: "implementation",
            order_index: index + 1,
            content: {
              title: step.title || `Etapa ${index + 1}`,
              description: step.description || '',
              instructions: step.instructions || step.description || '',
              tips: Array.isArray(step.tips) ? step.tips : [],
              resources: Array.isArray(step.resources) ? step.resources : []
            }
          });
        }
      });
    } else {
      // Se não há steps de implementação, criar um genérico
      console.log('⚠️ Nenhum step de implementação encontrado, criando step genérico');
      steps.push({
        id: `${solution.id}-step-generic`,
        title: "Implementação",
        type: "implementation",
        order_index: 1,
        content: {
          title: "Implementação da Solução",
          description: "Siga os passos para implementar esta solução de IA em seu negócio.",
          instructions: "Os detalhes de implementação serão atualizados em breve.",
          tips: ["Teste em ambiente controlado primeiro", "Monitore os resultados"],
          resources: []
        }
      });
    }
    
    // 3. Checklist Step - Usar dados reais com fallback
    const checklistItems = solution.checklist_items || solution.checklist || [];
    
    if (Array.isArray(checklistItems) && checklistItems.length > 0) {
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
    } else {
      // Checklist genérico se não há itens específicos
      console.log('⚠️ Nenhum item de checklist encontrado, criando checklist genérico');
      steps.push({
        id: `${solution.id}-checklist`,
        title: "Verificação Final",
        type: "checklist",
        order_index: steps.length,
        content: {
          description: "Verifique se todos os itens foram implementados corretamente.",
          checklist: [
            {
              id: 'generic-1',
              title: 'Solução implementada com sucesso',
              description: 'Confirme que a solução está funcionando como esperado',
              checked: false
            },
            {
              id: 'generic-2',
              title: 'Testes realizados',
              description: 'Verifique se todos os testes foram executados',
              checked: false
            }
          ]
        }
      });
    }
    
    // 4. Completion Step - Sempre incluir
    steps.push({
      id: `${solution.id}-completion`,
      title: "Implementação Concluída",
      type: "completion",
      order_index: steps.length,
      content: {
        title: solution.title || 'Solução de IA',
        completion_message: "Parabéns! Você implementou com sucesso esta solução de IA.",
        completion_requirements: Array.isArray(solution.completion_requirements) 
          ? solution.completion_requirements 
          : ["Todos os passos foram concluídos", "Solução está funcionando corretamente"],
        next_steps: [
          "Monitore o desempenho da solução",
          "Colete feedback dos usuários",
          "Explore outras soluções disponíveis",
          "Compartilhe sua experiência na comunidade"
        ]
      }
    });
    
    console.log(`✅ ${steps.length} steps processados para ${solution.title}`);
    return steps;
  }, [solution]);
};
