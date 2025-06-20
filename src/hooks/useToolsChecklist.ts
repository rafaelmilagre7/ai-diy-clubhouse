
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SelectedTool } from "@/components/admin/solution/form/types";

// Interface local para Tool já que não está exportada do supabase
interface Tool {
  id: string;
  name: string;
  official_url: string;
  status: boolean;
}

export const useToolsChecklist = (solutionId: string | null) => {
  const [tools, setTools] = useState<SelectedTool[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTools, setSavingTools] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true as any)
          .order('name');

        setAvailableTools((data as any) || []);
        
        if (error) throw error;
      } catch (error) {
        console.error('Erro ao buscar ferramentas:', error);
      }
    };

    fetchAvailableTools();
  }, []);

  useEffect(() => {
    const fetchSelectedTools = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('solution_tools')
          .select('*')
          .eq('solution_id', solutionId as any)
          .order('order_index');

        if (error) throw error;

        const toolsWithDetails = await Promise.all(
          ((data as any) || []).map(async (solutionTool: any) => {
            const tool = availableTools.find(t => t.name === solutionTool.tool_name);
            return {
              ...tool,
              is_required: solutionTool.is_required,
              order_index: solutionTool.order_index
            };
          })
        );

        setTools(toolsWithDetails.filter(Boolean) as SelectedTool[]);
      } catch (error) {
        console.error('Erro ao buscar ferramentas da solução:', error);
        toast({
          title: "Erro ao carregar ferramentas",
          description: "Não foi possível carregar as ferramentas selecionadas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (availableTools.length > 0) {
      fetchSelectedTools();
    }
  }, [solutionId, availableTools, toast]);

  const saveTools = async () => {
    if (!solutionId) return;

    try {
      setSavingTools(true);

      // Remover ferramentas existentes
      await supabase
        .from('solution_tools')
        .delete()
        .eq('solution_id', solutionId as any);

      // Inserir novas ferramentas
      if (tools.length > 0) {
        const toolsToInsert = tools.map((tool, index) => ({
          solution_id: solutionId,
          tool_name: tool.name,
          tool_url: tool.official_url,
          is_required: tool.is_required,
          order_index: index
        }));

        const { error } = await supabase
          .from('solution_tools')
          .insert(toolsToInsert as any);

        if (error) throw error;
      }

      toast({
        title: "Ferramentas salvas",
        description: "As ferramentas foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar ferramentas:', error);
      toast({
        title: "Erro ao salvar ferramentas",
        description: "Ocorreu um erro ao salvar as ferramentas.",
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
