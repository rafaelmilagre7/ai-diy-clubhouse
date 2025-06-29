
import React from "react";
import { Loader2 } from "lucide-react";
import { SelectedTool } from "./types";
import { useToolSelector } from "./hooks/useToolSelector";
import { SearchBox } from "./components/SearchBox";
import { SelectedToolsList } from "./components/SelectedToolsList";
import { AvailableToolsList } from "./components/AvailableToolsList";

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
            tools={filteredTools}
            selectedToolIds={selectedToolIds}
            onToolSelect={handleToolSelect}
            onToolDeselect={handleToolDeselect}
          />
        )}
      </div>
    </div>
  );
};
