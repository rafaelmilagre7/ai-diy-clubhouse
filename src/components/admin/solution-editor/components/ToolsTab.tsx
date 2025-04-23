
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tool, Plus, Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ToolsTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

// Interface para ferramenta
interface ToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  official_url: string;
  is_selected?: boolean;
  is_required?: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [selectedTools, setSelectedTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTools, setSavingTools] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Carregar ferramentas disponíveis
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        // Carregar todas as ferramentas
        const { data: allTools, error: toolsError } = await supabase
          .from("tools")
          .select("*")
          .eq("status", true);

        if (toolsError) throw toolsError;

        // Carregar ferramentas já selecionadas para esta solução
        const { data: solutionTools, error: solutionToolsError } = await supabase
          .from("solution_tools")
          .select("*")
          .eq("solution_id", solution?.id || '');

        if (solutionToolsError && solution?.id) throw solutionToolsError;

        // Marcar ferramentas já selecionadas
        const toolsWithSelection = allTools?.map(tool => ({
          ...tool,
          is_selected: !!solutionTools?.find(st => st.tool_name === tool.name),
          is_required: solutionTools?.find(st => st.tool_name === tool.name)?.is_required || false
        })) || [];

        setTools(toolsWithSelection);
        setSelectedTools(toolsWithSelection.filter(t => t.is_selected));
      } catch (error) {
        toast({
          title: "Erro ao carregar ferramentas",
          description: "Não foi possível carregar as ferramentas disponíveis.",
          variant: "destructive"
        });
        console.error("Erro ao carregar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [solution?.id, toast]);

  // Filtrar ferramentas baseado na busca
  const filteredTools = searchTerm
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tools;

  // Marcar/desmarcar ferramenta
  const toggleTool = (toolId: string) => {
    setTools(prev => 
      prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, is_selected: !tool.is_selected }
          : tool
      )
    );
  };

  // Marcar/desmarcar ferramenta como obrigatória
  const toggleRequired = (toolId: string) => {
    setTools(prev => 
      prev.map(tool => 
        tool.id === toolId && tool.is_selected
          ? { ...tool, is_required: !tool.is_required }
          : tool
      )
    );
  };

  // Salvar ferramentas selecionadas
  const saveSelectedTools = async () => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar ferramentas.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSavingTools(true);
      
      // Ferramentas selecionadas
      const toolsToSave = tools.filter(t => t.is_selected).map(t => ({
        solution_id: solution.id,
        tool_name: t.name,
        tool_url: t.official_url,
        is_required: t.is_required || false
      }));

      // Primeiro remover todas as ferramentas existentes
      await supabase
        .from("solution_tools")
        .delete()
        .eq("solution_id", solution.id);

      // Depois adicionar as selecionadas
      if (toolsToSave.length > 0) {
        const { error } = await supabase
          .from("solution_tools")
          .insert(toolsToSave);

        if (error) throw error;
      }

      setSelectedTools(tools.filter(t => t.is_selected));
      toast({
        title: "Ferramentas salvas",
        description: "As ferramentas da solução foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar ferramentas:", error);
      toast({
        title: "Erro ao salvar ferramentas",
        description: "Ocorreu um erro ao tentar salvar as ferramentas.",
        variant: "destructive"
      });
    } finally {
      setSavingTools(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Ferramentas necessárias
            </CardTitle>
            <Button 
              onClick={saveSelectedTools} 
              disabled={saving || savingTools}
              size="sm"
            >
              {savingTools ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Salvar Ferramentas
                </>
              )}
            </Button>
          </div>
          <div className="mt-2">
            <Input
              placeholder="Buscar ferramentas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-md"
              type="search"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ferramenta encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <Card key={tool.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox 
                          checked={tool.is_selected}
                          onCheckedChange={() => toggleTool(tool.id)}
                          id={`tool-${tool.id}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <Label 
                              htmlFor={`tool-${tool.id}`}
                              className="font-medium cursor-pointer hover:text-primary"
                            >
                              {tool.name}
                            </Label>
                            <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {tool.category}
                            </Badge>
                          </div>
                          {tool.is_selected && (
                            <div className="flex items-center space-x-2 ml-4">
                              <Checkbox 
                                checked={tool.is_required}
                                onCheckedChange={() => toggleRequired(tool.id)}
                                id={`required-${tool.id}`}
                              />
                              <Label 
                                htmlFor={`required-${tool.id}`}
                                className="text-xs cursor-pointer"
                              >
                                Obrigatória
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={saveSelectedTools} 
          disabled={saving || savingTools}
        >
          {savingTools ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Salvar Ferramentas
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ToolsTab;
