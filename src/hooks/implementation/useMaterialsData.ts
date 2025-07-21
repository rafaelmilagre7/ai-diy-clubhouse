
import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface Material {
  id: string;
  name: string;
  title?: string;
  description?: string;
  url: string;
  type: string;
  file_type?: string;
  file_size?: number;
  format: string | null;
  solution_id: string;
  module_id: string | null;
}

export const useMaterialsData = (module: Module) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchMaterials = async () => {
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
      } catch (err) {
        logError("Error in materials fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [module.id, module.solution_id, log, logError]);

  return {
    materials,
    loading
  };
};
