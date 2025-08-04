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
            .is("module_id", null);
          
          if (solutionError) {
            logError("Error fetching materials:", solutionError);
            return;
          }
          
          console.log("DEBUG: Raw solution data before filtering:", solutionData);
          
          // Filter out video types, Panda Video content, and "Solution Resources" - they belong in other tabs
          const filteredData = (solutionData || []).filter(
            item => {
              const shouldInclude = item.type !== 'video' && 
                                    item.type !== 'resources' &&
                                    item.name !== 'Solution Resources' &&
                                    !item.url?.includes('pandavideo') && 
                                    !(item.metadata?.provider === 'panda');
              
              console.log(`DEBUG: Item "${item.name}" (type: ${item.type}) - Include: ${shouldInclude}`);
              return shouldInclude;
            }
          );
          
          console.log("DEBUG: Filtered materials:", filteredData);
          setMaterials(filteredData);
        } else {
          console.log("DEBUG: Raw module data before filtering:", moduleData);
          
          // Filter out video types, Panda Video content, and "Solution Resources" from module data too
          const filteredModuleData = moduleData.filter(
            item => {
              const shouldInclude = item.type !== 'video' && 
                                    item.type !== 'resources' &&
                                    item.name !== 'Solution Resources' &&
                                    !item.url?.includes('pandavideo') && 
                                    !(item.metadata?.provider === 'panda');
              
              console.log(`DEBUG: Module Item "${item.name}" (type: ${item.type}) - Include: ${shouldInclude}`);
              return shouldInclude;
            }
          );
          
          console.log("DEBUG: Filtered module materials:", filteredModuleData);
          setMaterials(filteredModuleData);
        }

        // Fetch external links from "Solution Resources" entry
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "resources")
          .eq("name", "Solution Resources")
          .is("module_id", null);

        console.log("DEBUG: Resources data for external links:", resourcesData);

        if (resourcesError) {
          logError("Error fetching resources:", resourcesError);
        } else if (resourcesData && resourcesData.length > 0) {
          try {
            // Parse the resources data to get external links
            const resourcesContent = JSON.parse(resourcesData[0].url);
            console.log("DEBUG: Parsed resources content:", resourcesContent);
            
            if (resourcesContent.external_links && Array.isArray(resourcesContent.external_links)) {
              console.log("DEBUG: Setting external links:", resourcesContent.external_links);
              setExternalLinks(resourcesContent.external_links);
            } else {
              console.log("DEBUG: No external_links found in resources content");
              setExternalLinks([]);
            }
          } catch (parseError) {
            logError("Error parsing external links:", parseError);
            console.log("DEBUG: Parse error details:", parseError);
            setExternalLinks([]);
          }
        } else {
          console.log("DEBUG: No Solution Resources found");
          setExternalLinks([]);
        }
      } catch (err) {
        logError("Error in materials fetch:", err);
        console.log("DEBUG: General error:", err);
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