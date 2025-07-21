
import { useMemo } from "react";
import { Module, Solution } from "@/lib/supabase";

export const useSolutionModules = (solution: Solution | null): Module[] => {
  
  return useMemo(() => {
    if (!solution) return [];
    
    const modules: Module[] = [];
    
    // 1. Cover/Landing Module - Informações Básicas
    modules.push({
      id: `${solution.id}-cover`,
      solution_id: solution.id,
      title: "Visão Geral da Solução",
      type: "cover",
      order_index: 0,
      content: {
        title: solution.title,
        description: solution.description,
        overview: solution.overview,
        image_url: solution.image_url,
        estimated_time: solution.estimated_time?.toString() || "2-4 horas",
        difficulty: solution.difficulty || "Intermediário",
        success_rate: "94%",
        learning_objectives: solution.learning_objectives || [
          "Configurar a solução de IA",
          "Integrar com sistemas existentes", 
          "Otimizar performance",
          "Monitorar resultados"
        ]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 2. Tools Module - Ferramentas Necessárias
    modules.push({
      id: `${solution.id}-tools`,
      solution_id: solution.id,
      title: "Ferramentas Necessárias",
      type: "tools",
      order_index: 1,
      content: {
        description: "Configure e acesse todas as ferramentas necessárias para implementar esta solução."
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 3. Materials Module - Materiais de Apoio
    modules.push({
      id: `${solution.id}-materials`,
      solution_id: solution.id,
      title: "Materiais de Apoio",
      type: "materials",
      order_index: 2,
      content: {
        description: "Baixe todos os templates, guias e recursos necessários."
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 4. Videos Module - Vídeos de Implementação
    modules.push({
      id: `${solution.id}-videos`,
      solution_id: solution.id,
      title: "Vídeos de Implementação",
      type: "videos",
      order_index: 3,
      content: {
        description: "Assista aos vídeos passo-a-passo para implementar a solução.",
        videos: solution.videos || []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 5. Implementation Module - Implementação Prática
    modules.push({
      id: `${solution.id}-implementation`,
      solution_id: solution.id,
      title: "Implementação Prática",
      type: "implementation",
      order_index: 4,
      content: {
        title: "Hora de Implementar",
        description: "Siga o passo-a-passo detalhado para implementar sua solução de IA.",
        implementation_steps: solution.implementation_steps || [],
        tips: solution.implementation_tips || []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 6. Checklist Module - Verificação Final
    modules.push({
      id: `${solution.id}-checklist`,
      solution_id: solution.id,
      title: "Verificação Final",
      type: "checklist",
      order_index: 5,
      content: {
        description: "Verifique se todos os itens foram implementados corretamente.",
        checklist: solution.checklist || [
          {
            id: "basic-setup",
            title: "Configuração básica realizada",
            description: "Verifique se todas as configurações iniciais foram feitas corretamente.",
            required: true,
            checked: false
          },
          {
            id: "integration-test",
            title: "Teste de integração concluído",
            description: "Confirme que a solução está integrada e funcionando com seus sistemas.",
            required: true,
            checked: false
          },
          {
            id: "performance-check",
            title: "Verificação de performance",
            description: "Teste o desempenho da solução em cenários reais.",
            required: true,
            checked: false
          },
          {
            id: "documentation",
            title: "Documentação atualizada",
            description: "Documente o processo de implementação para referência futura.",
            required: false,
            checked: false
          }
        ]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 7. Completion Module - Tela de Conclusão
    modules.push({
      id: `${solution.id}-completion`,
      solution_id: solution.id,
      title: "Implementação Concluída",
      type: "completion",
      order_index: 6,
      content: {
        title: solution.title,
        completion_message: "Parabéns! Você implementou com sucesso esta solução de IA.",
        next_steps: [
          "Monitore o desempenho da solução",
          "Colete feedback dos usuários",
          "Explore outras soluções disponíveis",
          "Compartilhe sua experiência na comunidade"
        ]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return modules;
  }, [solution]);
};
