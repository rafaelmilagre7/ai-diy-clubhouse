
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Wrench, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface ToolsTabProps {
  solution: any;
  onUpdate: (tools: any[]) => void;
  existingTools: any[];
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solution, onUpdate, existingTools = [] }) => {
  const [tools, setTools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<any[]>(existingTools || []);
  const { toast } = useToast();

  // Buscar ferramentas disponíveis
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setTools(data || []);
        
        // Inicializar ferramentas já selecionadas
        if (existingTools && existingTools.length > 0) {
          setSelectedTools(existingTools);
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar ferramentas",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [existingTools, toast]);

  // Filtrar ferramentas com base na busca
  const filteredTools = searchQuery 
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.category && tool.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tools;

  // Verificar se uma ferramenta está selecionada
  const isToolSelected = (toolId: string) => {
    return selectedTools.some(tool => tool.id === toolId);
  };

  // Adicionar ou remover ferramenta
  const toggleTool = (tool: any) => {
    if (isToolSelected(tool.id)) {
      setSelectedTools(prev => prev.filter(t => t.id !== tool.id));
    } else {
      setSelectedTools(prev => [...prev, { 
        id: tool.id,
        name: tool.name,
        is_required: true, // Por padrão, todas as ferramentas são requeridas
        url: tool.official_url,
        logo_url: tool.logo_url
      }]);
    }
  };

  // Atualizar se a ferramenta é requerida
  const toggleRequired = (toolId: string) => {
    setSelectedTools(prev => 
      prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, is_required: !tool.is_required } 
          : tool
      )
    );
  };

  // Remover ferramenta
  const removeTool = (toolId: string) => {
    setSelectedTools(prev => prev.filter(tool => tool.id !== toolId));
  };

  // Salvar mudanças quando houver alterações nas ferramentas selecionadas
  useEffect(() => {
    onUpdate(selectedTools);
  }, [selectedTools, onUpdate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ferramentas Necessárias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione as ferramentas necessárias para implementar esta solução
          </p>
        </CardHeader>
        <CardContent>
          {selectedTools.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <Wrench className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Nenhuma ferramenta selecionada
              </p>
              <p className="text-sm text-muted-foreground/75">
                Busque e adicione ferramentas abaixo
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTools.map(tool => (
                <div 
                  key={tool.id}
                  className="p-4 border rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {tool.logo_url && (
                      <img 
                        src={tool.logo_url} 
                        alt={tool.name} 
                        className="w-8 h-8 mr-3 rounded-md object-contain" 
                      />
                    )}
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="flex items-center mt-1">
                        <Checkbox 
                          id={`required-${tool.id}`} 
                          checked={tool.is_required} 
                          onCheckedChange={() => toggleRequired(tool.id)}
                        />
                        <Label 
                          htmlFor={`required-${tool.id}`}
                          className="ml-2 text-xs cursor-pointer text-muted-foreground"
                        >
                          Obrigatória para implementação
                        </Label>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeTool(tool.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Ferramentas</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input 
              type="search" 
              placeholder="Buscar ferramentas..."
              className="pl-8" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma ferramenta encontrada
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map(tool => (
                <div 
                  key={tool.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    isToolSelected(tool.id) 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleTool(tool)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {tool.logo_url ? (
                        <img 
                          src={tool.logo_url} 
                          alt={tool.name} 
                          className="w-8 h-8 mr-3 rounded-md object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 mr-3 rounded-md bg-muted flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-muted-foreground/70" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.category}</div>
                      </div>
                    </div>
                    <Button 
                      variant={isToolSelected(tool.id) ? "outline" : "ghost"} 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {isToolSelected(tool.id) ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolsTab;
