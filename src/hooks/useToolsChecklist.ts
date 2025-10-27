
import { useState, useEffect, useCallback } from "react";
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
      const { data, error } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const solutionToolsData: SelectedTool[] = [];
        
        for (const solutionTool of data) {
          // Priorizar busca por tool_id (mais confiável que tool_name)
          const fullTool = solutionTool.tool_id 
            ? availableTools.find(t => t.id === solutionTool.tool_id)
            : availableTools.find(t => t.name === solutionTool.tool_name);
          
          if (fullTool) {
            solutionToolsData.push({
              ...fullTool,
              is_required: solutionTool.is_required
            });
          } else {
            console.warn('Ferramenta não encontrada:', {
              tool_id: solutionTool.tool_id,
              tool_name: solutionTool.tool_name
            });
          }
        }
        
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

  // Memoizar saveTools para evitar dependências circulares
  const saveTools = useCallback(async () => {
    if (!solutionId) return;
    
    try {
      setSavingTools(true);
      console.log("🔧 Iniciando salvamento de ferramentas...");
      
      await supabase
        .from("solution_tools")
        .delete()
        .eq("solution_id", solutionId);
      
      if (tools.length > 0) {
        const toolsToInsert = tools.map(tool => ({
          solution_id: solutionId,
          tool_id: tool.id,
          tool_name: tool.name,
          tool_url: tool.official_url,
          is_required: tool.is_required
        }));
        
        const { error: insertError } = await supabase
          .from("solution_tools")
          .insert(toolsToInsert);
          
        if (insertError) throw insertError;
      }
      
      console.log("✅ Ferramentas salvas com sucesso");
      toast({
        title: "Ferramentas salvas",
        description: "As ferramentas foram salvas com sucesso.",
      });
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar ferramentas:", error);
      toast({
        title: "Erro ao salvar ferramentas",
        description: error.message || "Ocorreu um erro ao tentar salvar as ferramentas.",
        variant: "destructive",
      });
      throw error; // Re-throw para que o componente pai possa tratar
    } finally {
      setSavingTools(false);
    }
  }, [solutionId, tools, toast]);

  return {
    tools,
    setTools,
    loading,
    savingTools,
    saveTools
  };
};
