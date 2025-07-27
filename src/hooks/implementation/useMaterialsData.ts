
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

  useEffect(() => {
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
          
          // Filter out video types - they should be in the Videos tab only
          const filteredData = (solutionData || []).filter(
            item => item.type !== 'video'
          );
          
          setMaterials(filteredData);
        } else {
          // Filter out video types from module data too
          const filteredModuleData = moduleData.filter(
            item => item.type !== 'video'
          );
          
          setMaterials(filteredModuleData);
        }

        // Fetch external links from solution_resources with type 'resources'
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .eq("type", "resources")
          .is("module_id", null);

        if (resourcesError) {
          logError("Error fetching resources:", resourcesError);
        } else if (resourcesData && resourcesData.length > 0) {
          try {
            // Parse the resources data to get external links
            const resourcesContent = JSON.parse(resourcesData[0].url);
            if (resourcesContent.external_links && Array.isArray(resourcesContent.external_links)) {
              setExternalLinks(resourcesContent.external_links);
            }
          } catch (parseError) {
            logError("Error parsing external links:", parseError);
          }
        }
      } catch (err) {
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
