
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ToolSelector, SelectedTool } from "./ToolSelector";
import { useQuery } from "@tanstack/react-query";
import { Tool } from "@/types/toolTypes";

interface ToolsChecklistFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ToolsChecklistForm: React.FC<ToolsChecklistFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const [tools, setTools] = useState<SelectedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTools, setSavingTools] = useState(false);
  const { toast } = useToast();

  // Buscar ferramentas da solução e combinar com as ferramentas disponíveis
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
      
      // Verificar a estrutura da tabela para determinar quais colunas estão disponíveis
      const { data: tableInfo, error: tableError } = await supabase
        .from("solution_tools")
        .select("*")
        .limit(1);
      
      if (tableError) {
        console.error("Erro ao verificar estrutura da tabela:", tableError);
      }
      
      console.log("Estrutura da tabela solution_tools:", tableInfo);
      
      // Buscar ferramentas associadas à solução
      const { data, error } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Determinar se estamos usando tool_id ou tool_name para referência
        const useToolId = data[0].hasOwnProperty('tool_id');
        console.log("Usando tool_id para referência:", useToolId);
        
        // Para cada ferramenta na solução, buscar os dados completos da ferramenta
        const solutionToolsData: SelectedTool[] = [];
        
        for (const solutionTool of data) {
          if (useToolId && solutionTool.tool_id) {
            // Buscar a ferramenta correspondente no availableTools pelo ID
            const fullTool = availableTools.find(t => t.id === solutionTool.tool_id);
            
            if (fullTool) {
              solutionToolsData.push({
                ...fullTool,
                is_required: solutionTool.is_required
              });
            }
          } else if (solutionTool.tool_name) {
            // Buscar a ferramenta correspondente no availableTools pelo nome
            const fullTool = availableTools.find(t => t.name === solutionTool.tool_name);
            
            if (fullTool) {
              solutionToolsData.push({
                ...fullTool,
                is_required: solutionTool.is_required
              });
            } else {
              // Criar uma ferramenta básica a partir dos dados disponíveis
              solutionToolsData.push({
                id: solutionTool.id,
                name: solutionTool.tool_name,
                description: "Ferramenta associada à solução",
                official_url: solutionTool.tool_url || "",
                logo_url: null,
                category: "Outros",
                tags: [],
                status: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                video_tutorials: [],
                is_required: solutionTool.is_required
              });
            }
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

  const handleToolsChange = (selectedTools: SelectedTool[]) => {
    setTools(selectedTools);
  };

  const saveTools = async () => {
    if (!solutionId) return;
    
    try {
      setSavingTools(true);
      
      // Primeiro, excluir todas as ferramentas existentes
      const { error: deleteError } = await supabase
        .from("solution_tools")
        .delete()
        .eq("solution_id", solutionId);
        
      if (deleteError) throw deleteError;
      
      if (tools.length > 0) {
        // Verificar se a tabela solution_tools tem a coluna tool_id
        const { data: tableInfo, error: tableError } = await supabase
          .from("solution_tools")
          .select("*")
          .limit(1);
        
        console.log("Verificando estrutura da tabela antes de inserir:", tableInfo);
        
        // Preparar os dados para inserção com base na estrutura da tabela
        const toolsToInsert = tools.map(tool => {
          // Versão básica que funciona com tool_name (estrutura atual)
          const insertData: any = {
            solution_id: solutionId,
            tool_name: tool.name,
            tool_url: tool.official_url,
            is_required: tool.is_required
          };
          
          return insertData;
        });
        
        console.log("Inserindo ferramentas:", toolsToInsert);
        
        const { error: insertError, data: insertedData } = await supabase
          .from("solution_tools")
          .insert(toolsToInsert)
          .select();
          
        if (insertError) throw insertError;
        
        console.log("Ferramentas inseridas com sucesso:", insertedData);
      }
      
      toast({
        title: "Ferramentas salvas",
        description: "As ferramentas foram salvas com sucesso.",
      });
      
      // Chamar a função de salvamento da solução
      onSave();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Ferramentas Necessárias</h3>
        <p className="text-sm text-muted-foreground">
          Selecione as ferramentas que serão necessárias para implementar esta solução.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ToolSelector 
            value={tools} 
            onChange={handleToolsChange} 
          />
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveTools}
        disabled={savingTools || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingTools ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ToolsChecklistForm;
