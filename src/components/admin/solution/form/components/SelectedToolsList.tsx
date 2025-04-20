
import React from "react";
import { SelectedTool } from "../types";
import { SelectedToolCard } from "./SelectedToolCard";

interface SelectedToolsListProps {
  tools: SelectedTool[];
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
}

export const SelectedToolsList: React.FC<SelectedToolsListProps> = ({
  tools,
  onRemove,
  onToggleRequired,
}) => {
  if (tools.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Ferramentas selecionadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <SelectedToolCard
            key={tool.id}
            tool={tool}
            onRemove={onRemove}
            onToggleRequired={onToggleRequired}
          />
        ))}
      </div>
    </div>
  );
};
