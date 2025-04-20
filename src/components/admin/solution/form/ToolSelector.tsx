
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Wrench } from "lucide-react";
import { Tool, SolutionTool } from "@/types/toolTypes";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

export interface SelectedTool extends Tool {
  is_required: boolean;
}

interface ToolSelectorProps {
  value: SelectedTool[];
  onChange: (tools: SelectedTool[]) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ value, onChange }) => {
  const { log, logError } = useLogging();
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar ferramentas disponíveis
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tools")
          .select("*")
          .eq("status", true)
          .order("name");

        if (error) {
          logError("Erro ao carregar ferramentas", error);
          throw error;
        }

        setAvailableTools(data as Tool[]);
        log("Ferramentas carregadas com sucesso", { count: data.length });
      } catch (error) {
        console.error("Erro ao carregar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [log, logError]);

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

  return (
    <div className="space-y-6">
      {/* Lista de ferramentas selecionadas */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Ferramentas selecionadas</h3>
          <div className="space-y-2">
            {value.map((tool) => (
              <div
                key={tool.id}
                className="flex items-start p-3 border rounded-md bg-gray-50"
              >
                <div className="flex items-center min-w-0 flex-1 gap-x-4">
                  <div className="bg-blue-100 p-1.5 rounded">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tool.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {tool.description.substring(0, 100)}
                      {tool.description.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${tool.id}`}
                      checked={tool.is_required}
                      onCheckedChange={() => toggleRequired(tool.id)}
                    />
                    <label
                      htmlFor={`required-${tool.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Obrigatória
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTool(tool.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
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
      <div className="border rounded-md divide-y">
        {loading ? (
          <div className="p-4 text-center">Carregando ferramentas...</div>
        ) : filteredTools.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery
              ? "Nenhuma ferramenta encontrada para esta pesquisa."
              : "Nenhuma ferramenta disponível."}
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              className={`p-3 flex items-start ${
                isSelected(tool.id) ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center min-w-0 flex-1 gap-x-4">
                <div className="bg-blue-100 p-1.5 rounded">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tool.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {tool.description.substring(0, 100)}
                    {tool.description.length > 100 ? "..." : ""}
                  </p>
                </div>
              </div>
              <div>
                <Button
                  variant={isSelected(tool.id) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    isSelected(tool.id)
                      ? removeTool(tool.id)
                      : addTool(tool, true);
                  }}
                >
                  {isSelected(tool.id) ? "Selecionada" : "Adicionar"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Component auxiliar Button para evitar o erro de importação
const Button = ({
  children,
  variant,
  size,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "ghost" | "secondary";
  size?: "sm";
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm ${
        variant === "ghost"
          ? "text-gray-700 hover:bg-gray-100"
          : "bg-gray-200 text-gray-800"
      } ${size === "sm" ? "text-xs" : ""}`}
    >
      {children}
    </button>
  );
};
