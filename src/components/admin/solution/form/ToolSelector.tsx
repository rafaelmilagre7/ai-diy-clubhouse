
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Wrench, ExternalLink } from "lucide-react";
import { Tool, SolutionTool } from "@/types/toolTypes";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { useTools } from "@/hooks/useTools";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface SelectedTool extends Tool {
  is_required: boolean;
}

interface ToolSelectorProps {
  value: SelectedTool[];
  onChange: (tools: SelectedTool[]) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ value, onChange }) => {
  const { log, logError } = useLogging();
  const { tools: availableTools, isLoading } = useTools();
  const [searchQuery, setSearchQuery] = useState("");

  // Log para depuração dos logos das ferramentas
  useEffect(() => {
    if (availableTools && availableTools.length > 0) {
      const toolsWithLogos = availableTools.filter(tool => tool.logo_url);
      const toolsWithoutLogos = availableTools.filter(tool => !tool.logo_url);
      
      log('Ferramentas disponíveis para seleção', {
        total: availableTools.length,
        comLogos: toolsWithLogos.length,
        semLogos: toolsWithoutLogos.length,
        exemplosComLogo: toolsWithLogos.slice(0, 3).map(t => ({ 
          nome: t.name, 
          logo: t.logo_url 
        })),
        exemplosSemLogo: toolsWithoutLogos.slice(0, 3).map(t => t.name)
      });
    }
  }, [availableTools, log]);

  // Filtrar ferramentas com base na pesquisa
  const filteredTools = availableTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Verificar se uma ferramenta já está selecionada
  const isSelected = (id: string) => {
    return value.some((tool) => tool.id === id);
  };

  // Adicionar uma ferramenta à seleção
  const addTool = (tool: Tool, isRequired: boolean = true) => {
    if (!isSelected(tool.id)) {
      onChange([...value, { ...tool, is_required: isRequired }]);
    }
  };

  // Remover uma ferramenta da seleção
  const removeTool = (id: string) => {
    onChange(value.filter((tool) => tool.id !== id));
  };

  // Alternar o status de "obrigatório" de uma ferramenta
  const toggleRequired = (id: string) => {
    onChange(
      value.map((tool) =>
        tool.id === id ? { ...tool, is_required: !tool.is_required } : tool
      )
    );
  };

  // Renderizar imagem da ferramenta com tratamento de erros
  const renderToolImage = (tool: Tool) => {
    return tool.logo_url ? (
      <img 
        src={tool.logo_url} 
        alt={tool.name} 
        className="h-full w-full object-contain" 
        onError={(e) => {
          logError("Erro ao carregar imagem da ferramenta", { 
            tool: tool.name, 
            logo_url: tool.logo_url 
          });
          // Fallback para as iniciais
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = 'text-xl font-bold text-[#0ABAB5]';
            fallback.textContent = tool.name.substring(0, 2).toUpperCase();
            parent.appendChild(fallback);
          }
        }}
      />
    ) : (
      <div className="text-xl font-bold text-[#0ABAB5]">
        {tool.name.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Lista de ferramentas selecionadas */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Ferramentas selecionadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {value.map((tool) => (
              <Card key={tool.id} className="border overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {renderToolImage(tool)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm line-clamp-1">{tool.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 flex justify-between border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${tool.id}`}
                      checked={tool.is_required}
                      onCheckedChange={() => toggleRequired(tool.id)}
                    />
                    <label
                      htmlFor={`required-${tool.id}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Obrigatória
                    </label>
                  </div>
                  <button
                    className="text-sm text-red-600 hover:text-red-800"
                    onClick={() => removeTool(tool.id)}
                  >
                    Remover
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Caixa de pesquisa */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Pesquisar ferramentas..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista de ferramentas disponíveis */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-3">Ferramentas disponíveis</h3>
        {isLoading ? (
          <div className="p-4 text-center">Carregando ferramentas...</div>
        ) : filteredTools.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery
              ? "Nenhuma ferramenta encontrada para esta pesquisa."
              : "Nenhuma ferramenta disponível."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <Card 
                key={tool.id} 
                className={`flex flex-col h-full border overflow-hidden ${
                  isSelected(tool.id) ? "border-[#0ABAB5]" : ""
                }`}
              >
                <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {renderToolImage(tool)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm line-clamp-1">{tool.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-2 flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 flex justify-between border-t">
                  <button
                    className={`text-sm ${
                      isSelected(tool.id)
                        ? "text-[#0ABAB5]"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                    onClick={() => {
                      isSelected(tool.id)
                        ? removeTool(tool.id)
                        : addTool(tool, true);
                    }}
                  >
                    {isSelected(tool.id) ? "Remover" : "Adicionar"}
                  </button>
                  
                  {tool.official_url && (
                    <a 
                      href={tool.official_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
