
import { useState, useEffect } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface SolutionModule {
  id: string;
  type: 'landing' | 'tools' | 'materials' | 'videos' | 'checklist' | 'celebration';
  title: string;
  content: any;
  order: number;
}

export const useSolutionModules = (solution: Solution | null) => {
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const generateModules = async () => {
      if (!solution) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const generatedModules: SolutionModule[] = [];

        // 1. Landing Module (sempre primeiro)
        generatedModules.push({
          id: 'landing',
          type: 'landing',
          title: 'Bem-vindo à Implementação',
          content: {
            title: solution.title,
            description: solution.description,
            overview: solution.overview
          },
          order: 0
        });

        // 2. Tools Module (se houver ferramentas)
        const { data: tools } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solution.id);

        if (tools && tools.length > 0) {
          generatedModules.push({
            id: 'tools',
            type: 'tools',
            title: 'Ferramentas Necessárias',
            content: { tools },
            order: generatedModules.length
          });
        }

        // 3. Materials Module (se houver materiais)
        const { data: materials } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .in("type", ["document", "image", "other"]);

        if (materials && materials.length > 0) {
          generatedModules.push({
            id: 'materials',
            type: 'materials',
            title: 'Materiais de Apoio',
            content: { materials },
            order: generatedModules.length
          });
        }

        // 4. Videos Module (se houver vídeos)
        const { data: videos } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .in("type", ["video", "youtube"]);

        if (videos && videos.length > 0) {
          generatedModules.push({
            id: 'videos',
            type: 'videos',
            title: 'Vídeos Instrucionais',
            content: { videos },
            order: generatedModules.length
          });
        }

        // 5. Implementation Steps (se houver)
        if (solution.implementation_steps && solution.implementation_steps.length > 0) {
          solution.implementation_steps.forEach((step: any, index: number) => {
            generatedModules.push({
              id: `step-${index}`,
              type: 'materials',
              title: step.title || `Etapa ${index + 1}`,
              content: {
                html: step.description || step.content,
                text: step.title
              },
              order: generatedModules.length
            });
          });
        }

        // 6. Checklist Module (se houver)
        if (solution.checklist_items && solution.checklist_items.length > 0) {
          generatedModules.push({
            id: 'checklist',
            type: 'checklist',
            title: 'Lista de Verificação',
            content: { 
              checklist: solution.checklist_items 
            },
            order: generatedModules.length
          });
        }

        // 7. Celebration Module (sempre último)
        generatedModules.push({
          id: 'celebration',
          type: 'celebration',
          title: 'Parabéns!',
          content: {
            title: 'Implementação Concluída',
            message: 'Você completou com sucesso a implementação desta solução!'
          },
          order: generatedModules.length
        });

        log("Módulos gerados para a solução", { 
          solutionId: solution.id,
          moduleCount: generatedModules.length,
          moduleTypes: generatedModules.map(m => m.type)
        });

        setModules(generatedModules);
      } catch (error) {
        logError("Erro ao gerar módulos da solução", error);
        // Módulos mínimos em caso de erro
        setModules([
          {
            id: 'landing',
            type: 'landing',
            title: 'Bem-vindo',
            content: { title: solution?.title || 'Solução' },
            order: 0
          },
          {
            id: 'celebration',
            type: 'celebration',
            title: 'Finalização',
            content: { title: 'Concluído' },
            order: 1
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    generateModules();
  }, [solution, log, logError]);

  return {
    modules,
    loading,
    totalModules: modules.length
  };
};
