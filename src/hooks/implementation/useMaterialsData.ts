
import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format: string;
  size?: number;
}

export const useMaterialsData = (module: Module) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { log, logError } = useLogging("useMaterialsData");

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!module || !module.solution_id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        log("Buscando materiais", { module_id: module.id, solution_id: module.solution_id });
        
        // Primeiro buscamos materiais específicos do módulo
        const { data: moduleMaterials, error: moduleError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("module_id", module.id)
          .not("type", "eq", "video");
          
        if (moduleError) {
          logError("Erro ao buscar materiais do módulo", { error: moduleError });
        }
        
        // Depois buscamos materiais gerais da solução
        const { data: solutionMaterials, error: solutionError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .is("module_id", null)
          .not("type", "eq", "video");
          
        if (solutionError) {
          logError("Erro ao buscar materiais da solução", { error: solutionError });
        }
        
        // Combinamos os resultados
        const allMaterials = [
          ...(moduleMaterials || []),
          ...(solutionMaterials || [])
        ];
        
        if (allMaterials.length > 0) {
          log("Materiais encontrados", { count: allMaterials.length });
          
          // Formatar materiais para o formato esperado
          const formattedMaterials = allMaterials.map(material => ({
            id: material.id,
            name: material.name,
            url: material.url,
            type: material.type,
            format: material.format || "Documento",
            size: material.size
          }));
          
          setMaterials(formattedMaterials);
        } else {
          log("Nenhum material encontrado", { module_id: module.id });
          setMaterials([]);
        }
      } catch (error) {
        logError("Erro ao buscar materiais", { error });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [module, log, logError]);
  
  return { materials, loading };
};
