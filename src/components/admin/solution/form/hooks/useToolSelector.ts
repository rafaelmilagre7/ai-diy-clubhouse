
import { useState, useEffect } from "react";
import { Tool } from "@/types/toolTypes";
import { SelectedTool } from "../types";
import { useLogging } from "@/hooks/useLogging";
import { useTools } from "@/hooks/useTools";

export const useToolSelector = (value: SelectedTool[], onChange: (tools: SelectedTool[]) => void) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { tools: availableTools, isLoading } = useTools();
  const { log } = useLogging();

  useEffect(() => {
    if (availableTools && availableTools.length > 0) {
      const toolsWithLogos = availableTools.filter(tool => tool.logo_url);
      log('Ferramentas disponíveis para seleção', {
        total: availableTools.length,
        comLogos: toolsWithLogos.length,
        semLogos: availableTools.length - toolsWithLogos.length
      });
    }
  }, [availableTools, log]);

  const filteredTools = (availableTools || []).filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedToolIds = new Set(value.map(tool => tool.id));

  const handleToolSelect = (tool: Tool) => {
    if (!selectedToolIds.has(tool.id)) {
      onChange([...value, { ...tool, is_required: true }]);
    }
  };

  const handleToolDeselect = (id: string) => {
    onChange(value.filter((tool) => tool.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    onChange(
      value.map((tool) =>
        tool.id === id ? { ...tool, is_required: !tool.is_required } : tool
      )
    );
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredTools,
    isLoading,
    selectedToolIds,
    handleToolSelect,
    handleToolDeselect,
    handleToggleRequired
  };
};
