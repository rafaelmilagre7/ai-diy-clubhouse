
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Tool } from "@/types/toolTypes";

export interface SelectedTool extends Tool {
  is_required: boolean;
}

export const useToolsChecklist = (solutionId: string | null) => {
  const [tools, setTools] = useState<SelectedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTools, setSavingTools] = useState(false);
  const { toast } = useToast();

  const { data: availableTools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('status', true);
        
      if (error) throw error;
      return data as Tool[];
    }
  });

  useEffect(() => {
    if (solutionId) {
      fetchTools();
    } else {
      setLoading(false);
    }
  }, [solutionId, availableTools]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      
      // Primeiro tentar a nova tabela de referência
      const { data: referenceData, error: referenceError } = await supabase
        .from("solution_tools_reference")
        .select(`
          *,
          tools (*)
        `)
        .eq("solution_id", solutionId);
      
      if (referenceError) {
        console.warn("Erro ao buscar da tabela de referência, tentando fallback:", referenceError);
        
        // Fallback para a tabela antiga
        const { data: oldData, error: oldError } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solutionId);
          
        if (oldError) throw oldError;
        
        if (oldData && oldData.length > 0) {
          const solutionToolsData: SelectedTool[] = [];
          
          for (const solutionTool of oldData) {
            const fullTool = availableTools.find(t => 
              t.name.toLowerCase().trim() === solutionTool.tool_name.toLowerCase().trim()
            );
            
            if (fullTool) {
              solutionToolsData.push({
                ...fullTool,
                is_required: solutionTool.is_required
              });
            }
          }
          
          setTools(solutionToolsData);
        }
      } else if (referenceData && referenceData.length > 0) {
        // Usar dados da nova tabela de referência
        const solutionToolsData: SelectedTool[] = referenceData.map(ref => ({
          ...ref.tools,
          is_required: ref.is_required
        }));
        
        setTools(solutionToolsData);
      }
    } catch (error) {
      console.error("Erro ao carregar ferramentas:", error);
      toast({
        title: "Erro ao carregar ferramentas",
        description: "Não foi possível carregar a lista de ferramentas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTools = async () => {
    if (!solutionId) return;
    
    try {
      setSavingTools(true);
      
      // Limpar dados existentes nas duas tabelas
      await supabase
        .from("solution_tools_reference")
        .delete()
        .eq("solution_id", solutionId);
        
      await supabase
        .from("solution_tools")
        .delete()
        .eq("solution_id", solutionId);
      
      if (tools.length > 0) {
        // Inserir na nova tabela de referência
        const referenceToolsToInsert = tools.map((tool, index) => ({
          solution_id: solutionId,
          tool_id: tool.id,
          is_required: tool.is_required,
          order_index: index
        }));
        
        const { error: referenceInsertError } = await supabase
          .from("solution_tools_reference")
          .insert(referenceToolsToInsert);
          
        if (referenceInsertError) throw referenceInsertError;
        
        // Manter compatibilidade com a tabela antiga
        const oldToolsToInsert = tools.map(tool => ({
          solution_id: solutionId,
          tool_name: tool.name,
          tool_url: tool.official_url,
          is_required: tool.is_required
        }));
        
        const { error: oldInsertError } = await supabase
          .from("solution_tools")
          .insert(oldToolsToInsert);
          
        if (oldInsertError) {
          console.warn("Erro ao inserir na tabela antiga (não crítico):", oldInsertError);
        }
      }
      
      toast({
        title: "Ferramentas salvas",
        description: "As ferramentas foram salvas com sucesso.",
      });
      
    } catch (error: any) {
      console.error("Erro ao salvar ferramentas:", error);
      toast({
        title: "Erro ao salvar ferramentas",
        description: error.message || "Ocorreu um erro ao tentar salvar as ferramentas.",
        variant: "destructive",
      });
    } finally {
      setSavingTools(false);
    }
  };

  return {
    tools,
    setTools,
    loading,
    savingTools,
    saveTools
  };
};
