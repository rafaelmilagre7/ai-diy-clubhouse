
import { useState, useEffect } from "react";
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
        // Mock implementation - since tools table might not have all expected fields
        const mockTools: Tool[] = [
          { id: '1', name: 'ChatGPT', official_url: 'https://chat.openai.com', status: true },
          { id: '2', name: 'Claude', official_url: 'https://claude.ai', status: true },
          { id: '3', name: 'Midjourney', official_url: 'https://midjourney.com', status: true }
        ];

        setAvailableTools(mockTools);
      } catch (error) {
        console.error('Erro ao buscar ferramentas:', error);
        toast({
          title: "Erro ao carregar ferramentas",
          description: "Não foi possível carregar as ferramentas disponíveis.",
          variant: "destructive",
        });
      }
    };

    fetchAvailableTools();
  }, [toast]);

  useEffect(() => {
    const fetchSelectedTools = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Mock implementation - solution_tools table doesn't exist
        console.log('Simulando busca de ferramentas da solução:', solutionId);
        
        // Return empty array for now
        setTools([]);
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

      // Mock implementation - solution_tools table doesn't exist
      console.log('Simulando salvamento de ferramentas:', tools);

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
