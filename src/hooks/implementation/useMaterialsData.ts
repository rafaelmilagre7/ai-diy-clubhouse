import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string | null;
  solution_id: string;
  module_id: string | null;
}

export interface ExternalLink {
  title: string;
  description: string;
  url: string;
}

export const useMaterialsData = (module: Module) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  console.log("🔥 useMaterialsData INICIADO para módulo:", module.id, "solução:", module.solution_id);

  useEffect(() => {
    console.log("🔥 useEffect executando para módulo:", module.id);
    const fetchMaterialsAndLinks = async () => {
      try {
        setLoading(true);
        
        // First try to find materials specific to this module
        let { data: moduleData, error: moduleError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id);
        
        // If no module-specific materials or error, fetch solution-level materials
        if (moduleError || !moduleData || moduleData.length === 0) {
          const { data: solutionData, error: solutionError } = await supabase
            .from("solution_resources")
            .select("*")
            .eq("solution_id", module.solution_id)
            .neq("type", "resources") // Excluir completamente tipo 'resources'
            .neq("name", "Solution Resources") // Excluir por nome também
            .is("module_id", null);
          
          if (solutionError) {
            logError("Error fetching materials:", solutionError);
            return;
          }
          
          console.log("🔥 Raw solution data (já filtrado na query):", solutionData);
          
          // Filtro adicional para garantir que nada do tipo 'resources' passe
          const filteredData = (solutionData || []).filter(
            item => {
              const shouldInclude = item.type !== 'video' && 
                                    item.type !== 'resources' &&
                                    item.name !== 'Solution Resources' &&
                                    !item.url?.includes('pandavideo') && 
                                    !(item.metadata?.provider === 'panda');
              
              console.log(`🔥 Item "${item.name}" (type: ${item.type}) - Include: ${shouldInclude}`);
              return shouldInclude;
            }
          );
          
          console.log("🔥 Filtered materials:", filteredData);
          setMaterials(filteredData);
        } else {
          console.log("🔥 Raw module data before filtering:", moduleData);
          
          // Filter out video types, Panda Video content, and "Solution Resources" from module data too
          const filteredModuleData = moduleData.filter(
            item => {
              const shouldInclude = item.type !== 'video' && 
                                    item.type !== 'resources' &&
                                    item.name !== 'Solution Resources' &&
                                    !item.url?.includes('pandavideo') && 
                                    !(item.metadata?.provider === 'panda');
              
              console.log(`🔥 Module Item "${item.name}" (type: ${item.type}) - Include: ${shouldInclude}`);
              return shouldInclude;
            }
          );
          
          console.log("🔥 Filtered module materials:", filteredModuleData);
          setMaterials(filteredModuleData);
        }

        // SEMPRE buscar external links independente de ter materiais ou não
        console.log("🔥 Buscando external links para solução:", module.solution_id);
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "resources")
          .eq("name", "Solution Resources")
          .is("module_id", null);

        console.log("🔥 Resources data encontrados:", resourcesData);

        if (resourcesError) {
          console.error("🔥 Erro ao buscar resources:", resourcesError);
          logError("Error fetching resources:", resourcesError);
          setExternalLinks([]);
        } else if (resourcesData && resourcesData.length > 0) {
          try {
            // Parse the resources data to get external links
            const resourcesContent = JSON.parse(resourcesData[0].url);
            console.log("🔥 Conteúdo parseado dos resources:", resourcesContent);
            
            if (resourcesContent.external_links && Array.isArray(resourcesContent.external_links)) {
              console.log("🔥 External links encontrados:", resourcesContent.external_links);
              setExternalLinks(resourcesContent.external_links);
            } else {
              console.log("🔥 Nenhum external_link encontrado no JSON");
              setExternalLinks([]);
            }
          } catch (parseError) {
            console.error("🔥 Erro ao fazer parse dos external links:", parseError);
            logError("Error parsing external links:", parseError);
            setExternalLinks([]);
          }
        } else {
          console.log("🔥 Nenhum Solution Resources encontrado");
          setExternalLinks([]);
        }
      } catch (err) {
        console.error("🔥 Erro geral:", err);
        logError("Error in materials fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialsAndLinks();
  }, [module.id, module.solution_id, log, logError]);

  return {
    materials,
    externalLinks,
    loading
  };
};