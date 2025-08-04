
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
        console.log("🔍 MODULES: Nenhuma solução fornecida");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔧 GERANDO MÓDULOS para solução:", solution.id);
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
        console.log("✅ Módulo Landing adicionado");

        // 2. Tools Module (se houver ferramentas)
        console.log("🔍 Buscando ferramentas para solução:", solution.id);
        const { data: tools, error: toolsError } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solution.id);

        if (toolsError) {
          console.error("❌ Erro ao buscar ferramentas:", toolsError);
        } else {
          console.log("🔧 Ferramentas encontradas:", tools?.length || 0);
        }

        if (tools && tools.length > 0) {
          generatedModules.push({
            id: 'tools',
            type: 'tools',
            title: 'Ferramentas Necessárias',
            content: { tools },
            order: generatedModules.length
          });
          console.log("✅ Módulo Tools adicionado com", tools.length, "ferramentas");
        }

        // 3. Materials Module (se houver materiais que não sejam vídeos nem "resources")
        console.log("🔍 Buscando materiais para solução:", solution.id);
        const { data: materials, error: materialsError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .not("type", "in", "(video,resources)")
          .neq("name", "Solution Resources")
          .is("module_id", null);

        if (materialsError) {
          console.error("❌ Erro ao buscar materiais:", materialsError);
        } else {
          console.log("📄 Materiais encontrados:", materials?.length || 0);
        }

        // Sempre adicionar módulo de materiais para mostrar links auxiliares
        generatedModules.push({
          id: 'materials',
          type: 'materials',
          title: 'Materiais e Recursos',
          content: { 
            materials: materials || [],
            solution_id: solution.id 
          },
          order: generatedModules.length
        });
        console.log("✅ Módulo Materials SEMPRE adicionado com", materials?.length || 0, "materiais");

        // 4. Videos Module (se houver vídeos)
        console.log("🔍 Buscando vídeos para solução:", solution.id);
        const { data: videos, error: videosError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .in("type", ["video", "youtube"]);

        if (videosError) {
          console.error("❌ Erro ao buscar vídeos:", videosError);
        } else {
          console.log("🎥 Vídeos encontrados:", videos?.length || 0);
        }

        if (videos && videos.length > 0) {
          generatedModules.push({
            id: 'videos',
            type: 'videos',
            title: 'Vídeos Instrucionais',
            content: { videos },
            order: generatedModules.length
          });
          console.log("✅ Módulo Videos adicionado com", videos.length, "vídeos");
        }

        // 5. Checklist Module (sempre inclui para buscar do unified_checklists)
        console.log("🔍 Adicionando módulo de checklist unificado");
        generatedModules.push({
          id: 'checklist',
          type: 'checklist',
          title: 'Lista de Verificação',
          content: { 
            hasUnifiedChecklist: true
          },
          order: generatedModules.length
        });
        console.log("✅ Módulo Checklist Unificado adicionado");

        // 6. Celebration Module (sempre último)
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
        console.log("✅ Módulo Celebration adicionado");

        console.log("🎯 MÓDULOS FINAIS GERADOS:", {
          solutionId: solution.id,
          totalModules: generatedModules.length,
          moduleTypes: generatedModules.map(m => ({ type: m.type, title: m.title }))
        });

        log("Módulos gerados para a solução", { 
          solutionId: solution.id,
          moduleCount: generatedModules.length,
          moduleTypes: generatedModules.map(m => m.type)
        });

        setModules(generatedModules);
      } catch (error) {
        console.error("❌ ERRO GERAL ao gerar módulos:", error);
        logError("Erro ao gerar módulos da solução", error);
        // Módulos mínimos em caso de erro
        const fallbackModules = [
          {
            id: 'landing',
            type: 'landing' as const,
            title: 'Bem-vindo',
            content: { title: solution?.title || 'Solução' },
            order: 0
          },
          {
            id: 'celebration',
            type: 'celebration' as const,
            title: 'Finalização',
            content: { title: 'Concluído' },
            order: 1
          }
        ];
        console.log("🔄 Usando módulos de fallback:", fallbackModules);
        setModules(fallbackModules);
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
