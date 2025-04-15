
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ToolSelector, SelectedTool } from "./ToolSelector";

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

  useEffect(() => {
    if (solutionId) {
      fetchTools();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_tools")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Converter os dados do banco para o formato esperado pelo seletor
        const selectedTools = data.map(item => ({
          id: item.tool_name.toLowerCase().replace(/\s+/g, "-"),
          name: item.tool_name,
          url: item.tool_url || "",
          description: "",
          is_required: item.is_required
        }));
        
        setTools(selectedTools);
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
      
      if (tools.length === 0) {
        toast({
          title: "Nenhuma ferramenta adicionada",
          description: "Adicione pelo menos uma ferramenta para continuar.",
          variant: "destructive",
        });
        setSavingTools(false);
        return;
      }
      
      // Primeiro, excluir todas as ferramentas existentes
      const { error: deleteError } = await supabase
        .from("solution_tools")
        .delete()
        .eq("solution_id", solutionId);
        
      if (deleteError) throw deleteError;
      
      // Depois, inserir as novas ferramentas
      const toolsToInsert = tools.map(tool => ({
        solution_id: solutionId,
        tool_name: tool.name,
        tool_url: tool.url || null,
        is_required: tool.is_required
      }));
      
      const { error: insertError } = await supabase
        .from("solution_tools")
        .insert(toolsToInsert);
        
      if (insertError) throw insertError;
      
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
