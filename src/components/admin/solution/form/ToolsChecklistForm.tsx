
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Tool, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface ToolsChecklistFormProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

interface ToolItem {
  id?: string;
  solution_id: string;
  tool_name: string;
  tool_url?: string;
  is_required: boolean;
}

const ToolsChecklistForm: React.FC<ToolsChecklistFormProps> = ({
  solutionId,
  onSave,
  saving: parentSaving
}) => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchTools();
    }
  }, [solutionId]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solution_tools')
        .select('*')
        .eq('solution_id', solutionId);

      if (error) throw error;

      setTools(data || []);
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as ferramentas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = () => {
    setTools([
      ...tools,
      {
        solution_id: solutionId,
        tool_name: '',
        tool_url: '',
        is_required: true
      }
    ]);
  };

  const handleRemoveTool = (index: number) => {
    const newTools = [...tools];
    newTools.splice(index, 1);
    setTools(newTools);
  };

  const handleToolChange = (index: number, field: keyof ToolItem, value: any) => {
    const newTools = [...tools];
    newTools[index] = {
      ...newTools[index],
      [field]: value
    };
    setTools(newTools);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Filtrar ferramentas vazias
      const validTools = tools.filter(tool => tool.tool_name);

      // Para cada ferramenta, atualizar ou inserir no banco
      for (const tool of validTools) {
        const toolData = {
          solution_id: solutionId,
          tool_name: tool.tool_name,
          tool_url: tool.tool_url,
          is_required: tool.is_required
        };

        if (tool.id) {
          // Atualizar ferramenta existente
          const { error } = await supabase
            .from('solution_tools')
            .update(toolData)
            .eq('id', tool.id);

          if (error) throw error;
        } else {
          // Inserir nova ferramenta
          const { error } = await supabase
            .from('solution_tools')
            .insert(toolData);

          if (error) throw error;
        }
      }

      // Chamar a função de callback
      await onSave();

      toast({
        title: 'Sucesso',
        description: 'Ferramentas salvas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar ferramentas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as ferramentas',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando ferramentas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Ferramentas necessárias</h3>
        <p className="text-muted-foreground mt-1">
          Adicione as ferramentas que são necessárias para implementar esta solução.
        </p>
      </div>

      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-md">
          <Tool className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma ferramenta adicionada</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleAddTool}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar ferramenta
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {tools.map((tool, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`tool-name-${index}`}>Nome da ferramenta</Label>
                  <Input
                    id={`tool-name-${index}`}
                    value={tool.tool_name}
                    onChange={(e) => handleToolChange(index, 'tool_name', e.target.value)}
                    placeholder="Nome da ferramenta"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`tool-url-${index}`}>URL da ferramenta</Label>
                  <Input
                    id={`tool-url-${index}`}
                    value={tool.tool_url}
                    onChange={(e) => handleToolChange(index, 'tool_url', e.target.value)}
                    placeholder="https://www.exemplo.com"
                  />
                  {tool.tool_url && (
                    <div className="mt-2">
                      <a 
                        href={tool.tool_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        Acessar link <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`tool-required-${index}`}
                    checked={tool.is_required}
                    onCheckedChange={(checked) => handleToolChange(index, 'is_required', checked)}
                  />
                  <Label htmlFor={`tool-required-${index}`}>Ferramenta obrigatória</Label>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveTool(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover ferramenta
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTool}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar ferramenta
            </Button>
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || parentSaving}
            >
              Salvar ferramentas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsChecklistForm;
