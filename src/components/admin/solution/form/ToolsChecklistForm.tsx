
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ToolsChecklistFormProps {
  solutionId: string;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

interface ToolItem {
  id?: string;
  solution_id: string;
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  required: boolean;
}

const ToolsChecklistForm: React.FC<ToolsChecklistFormProps> = ({
  solutionId,
  onSave,
  isSaving = false
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
        .eq('solution_id', solutionId)
        .order('name');

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
        name: '',
        description: '',
        url: '',
        required: false
      }
    ]);
  };

  const handleRemoveTool = (index: number) => {
    const newTools = [...tools];
    newTools.splice(index, 1);
    setTools(newTools);
  };

  const handleToolChange = (index: number, field: keyof ToolItem, value: string | boolean) => {
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
      const validTools = tools.filter(tool => tool.name);

      // Para cada ferramenta, atualizar ou inserir no banco
      for (const tool of validTools) {
        const toolData = {
          solution_id: solutionId,
          name: tool.name,
          description: tool.description,
          url: tool.url,
          icon: tool.icon || 'tool',
          required: tool.required
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
          Adicione as ferramentas necessárias para implementar esta solução.
        </p>
      </div>

      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-md">
          <Wrench className="h-10 w-10 text-muted-foreground mb-2" />
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
                    value={tool.name}
                    onChange={(e) => handleToolChange(index, 'name', e.target.value)}
                    placeholder="Nome da ferramenta"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`tool-description-${index}`}>Descrição</Label>
                  <Textarea
                    id={`tool-description-${index}`}
                    value={tool.description}
                    onChange={(e) => handleToolChange(index, 'description', e.target.value)}
                    placeholder="Descrição da ferramenta"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`tool-url-${index}`}>URL</Label>
                  <Input
                    id={`tool-url-${index}`}
                    value={tool.url}
                    onChange={(e) => handleToolChange(index, 'url', e.target.value)}
                    placeholder="https://ferramenta.com"
                  />
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
              disabled={saving || isSaving}
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
