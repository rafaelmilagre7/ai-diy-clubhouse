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
  console.log("🔥 Module completo:", JSON.stringify(module, null, 2));

  useEffect(() => {
    console.log("🔥 useEffect executando para módulo:", module.id);
    const fetchMaterialsAndLinks = async () => {
      try {
        setLoading(true);
        console.log("🔥 Iniciando busca de materiais e links para:", module.solution_id);
        
        // 1. Buscar materiais que não sejam vídeos nem "Solution Resources"
        const { data: solutionData, error: solutionError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .not("type", "in", "(video,resources)")
          .neq("name", "Solution Resources")
          .is("module_id", null);
        
        if (solutionError) {
          console.error("🔥 Erro ao buscar materiais:", solutionError);
          logError("Error fetching materials:", solutionError);
        } else {
          console.log("🔥 Materiais encontrados:", solutionData);
          
          // Filtro adicional para garantir que nada indesejado passe
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
          
          console.log("🔥 Materiais filtrados:", filteredData);
          setMaterials(filteredData);
        }

        // 2. SEMPRE buscar external links independente de ter materiais ou não
        console.log("🔥 Buscando external links para solução:", module.solution_id);
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "resources")
          .eq("name", "Solution Resources")
          .is("module_id", null);

        console.log("🔥 Resources data encontrados:", resourcesData);
        console.log("🔥 Resources data length:", resourcesData?.length || 0);

        if (resourcesError) {
          console.error("🔥 Erro ao buscar resources:", resourcesError);
          logError("Error fetching resources:", resourcesError);
          setExternalLinks([]);
        } else if (resourcesData && resourcesData.length > 0) {
          try {
            // Parse the resources data to get external links
            console.log("🔥 RAW resourcesData[0].url:", resourcesData[0].url);
            console.log("🔥 Tipo do URL:", typeof resourcesData[0].url);
            
            let resourcesContent;
            if (typeof resourcesData[0].url === 'string') {
              resourcesContent = JSON.parse(resourcesData[0].url);
            } else {
              resourcesContent = resourcesData[0].url;
            }
            
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