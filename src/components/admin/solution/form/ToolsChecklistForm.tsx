
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id?: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
}

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
  const [tools, setTools] = useState<Tool[]>([
    { tool_name: "", tool_url: "", is_required: true }
  ]);
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
        setTools(data);
      } else {
        setTools([{ tool_name: "", tool_url: "", is_required: true }]);
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

  const handleAddTool = () => {
    setTools([...tools, { tool_name: "", tool_url: "", is_required: true }]);
  };

  const handleRemoveTool = (index: number) => {
    const newTools = [...tools];
    newTools.splice(index, 1);
    
    // Se remover todos, adicionar um vazio
    if (newTools.length === 0) {
      newTools.push({ tool_name: "", tool_url: "", is_required: true });
    }
    
    setTools(newTools);
  };

  const handleToolChange = (index: number, field: keyof Tool, value: string | boolean) => {
    const newTools = [...tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setTools(newTools);
  };

  const saveTools = async () => {
    if (!solutionId) return;
    
    try {
      setSavingTools(true);
      
      // Filtrar ferramentas sem nome
      const validTools = tools.filter(tool => tool.tool_name.trim() !== "");
      
      if (validTools.length === 0) {
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
      const toolsToInsert = validTools.map(tool => ({
        solution_id: solutionId,
        tool_name: tool.tool_name,
        tool_url: tool.tool_url || null,
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
          Adicione as ferramentas que serão necessárias para implementar esta solução.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {tools.map((tool, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-md bg-gray-50">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`tool-name-${index}`}>Nome da Ferramenta</Label>
                <Input
                  id={`tool-name-${index}`}
                  value={tool.tool_name}
                  onChange={(e) => handleToolChange(index, "tool_name", e.target.value)}
                  placeholder="Ex: ChatGPT, Claude, Midjourney, etc."
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <Label htmlFor={`tool-url-${index}`}>URL (opcional)</Label>
                <Input
                  id={`tool-url-${index}`}
                  value={tool.tool_url || ""}
                  onChange={(e) => handleToolChange(index, "tool_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex flex-col justify-end gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`tool-required-${index}`} className="flex-grow">
                    Obrigatória
                  </Label>
                  <Switch
                    id={`tool-required-${index}`}
                    checked={tool.is_required}
                    onCheckedChange={(checked) => handleToolChange(index, "is_required", checked)}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveTool(index)}
                  className="mt-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddTool}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ferramenta
          </Button>
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
