
import { useState, useEffect } from "react";
import { Module, supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface Material {
  id: string;
  name: string;
  url?: string;
  file_url?: string;
  external_url?: string;
  type: string;
  format: string;
  size?: number;
  module_id?: string;
  solution_id?: string;
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
          .eq("module_id", module.id);
          
        if (moduleError) {
          logError("Erro ao buscar materiais do módulo", { error: moduleError });
          console.error("Erro ao buscar materiais do módulo:", moduleError);
        }
        
        // Depois buscamos materiais gerais da solução (exceto vídeos, que são tratados separadamente)
        const { data: solutionMaterials, error: solutionError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", module.solution_id)
          .is("module_id", null)
          .not("type", "eq", "video");
          
        if (solutionError) {
          logError("Erro ao buscar materiais da solução", { error: solutionError });
          console.error("Erro ao buscar materiais da solução:", solutionError);
        }
        
        // Combinamos os resultados
        const allMaterials = [
          ...(moduleMaterials || []),
          ...(solutionMaterials || [])
        ].filter(m => m.type !== "video"); // Garantir que vídeos não sejam incluídos aqui
        
        console.log("Materiais encontrados:", allMaterials);
        
        if (allMaterials.length > 0) {
          log("Materiais encontrados", { count: allMaterials.length });
          
          // Formatar materiais para o formato esperado
          const formattedMaterials = allMaterials.map(material => ({
            id: material.id,
            name: material.name,
            url: material.url,
            file_url: material.url, // Adicionando para compatibilidade
            external_url: material.metadata?.external_url || null,
            type: material.type || "document",
            format: material.format || "Documento",
            size: material.size,
            module_id: material.module_id,
            solution_id: material.solution_id
          }));
          
          setMaterials(formattedMaterials);
          log("Materiais formatados", { materials: formattedMaterials });
        } else {
          log("Nenhum material encontrado", { module_id: module.id });
          setMaterials([]);
        }
      } catch (error) {
        logError("Erro ao buscar materiais", { error });
        console.error("Erro ao buscar materiais:", error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [module, log, logError]);
  
  return { materials, loading };
};
