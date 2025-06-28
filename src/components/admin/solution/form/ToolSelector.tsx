
import React from "react";
import { Loader2 } from "lucide-react";
import { SelectedTool } from "./types";
import { useToolSelector } from "./hooks/useToolSelector";
import { SearchBox } from "./components/SearchBox";
import { SelectedToolsList } from "./components/SelectedToolsList";
import { AvailableToolsList } from "./components/AvailableToolsList";
import { Tool as ToolType } from "@/types/toolTypes";

interface ToolSelectorProps {
  value: SelectedTool[];
  onChange: (tools: SelectedTool[]) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ value, onChange }) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredTools,
    isLoading,
    selectedToolIds,
    handleToolSelect,
    handleToolDeselect,
    handleToggleRequired
  } = useToolSelector(value, onChange);

  // Convert tools to the format expected by AvailableToolsList
  const toolsForList: ToolType[] = filteredTools.map(tool => ({
    ...tool,
    status: tool.is_active,
    official_url: tool.url || '',
    tags: [],
    benefit_link: null,
    created_at: tool.created_at,
    updated_at: tool.updated_at,
    benefit_title: tool.benefit_title || null,
    benefit_description: tool.benefit_description || null,
    benefit_discount_percentage: tool.benefit_discount_percentage || null,
    category: tool.category as any, // Safe cast to ToolCategory
    has_member_benefit: tool.has_member_benefit,
    benefit_type: (tool.benefit_type as any) || 'other',
    features: tool.features || [],
    pricing_info: tool.pricing_info
  }));

  return (
    <div className="space-y-6">
      {value.length > 0 && (
        <SelectedToolsList
          tools={value}
          onRemove={handleToolDeselect}
          onToggleRequired={handleToggleRequired}
        />
      )}

      <SearchBox value={searchQuery} onChange={setSearchQuery} />

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-3">Ferramentas disponíveis</h3>
        {isLoading ? (
          <div className="p-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="mt-2">Carregando ferramentas...</p>
          </div>
        ) : (
          <AvailableToolsList
            tools={toolsForList}
            selectedToolIds={selectedToolIds}
            onToolSelect={handleToolSelect}
            onToolDeselect={handleToolDeselect}
          />
        )}
      </div>
    </div>
  );
};
