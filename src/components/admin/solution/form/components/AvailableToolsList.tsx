
import React from "react";
import { Tool } from "@/types/toolTypes";
import { AvailableToolCard } from "./AvailableToolCard";

interface AvailableToolsListProps {
  tools: Tool[];
  selectedToolIds: Set<string>;
  onToolSelect: (tool: Tool) => void;
  onToolDeselect: (id: string) => void;
}

export const AvailableToolsList: React.FC<AvailableToolsListProps> = ({
  tools,
  selectedToolIds,
  onToolSelect,
  onToolDeselect,
}) => {
  if (tools.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhuma ferramenta disponível.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <AvailableToolCard
          key={tool.id}
          tool={tool}
          isSelected={selectedToolIds.has(tool.id)}
          onSelect={() => onToolSelect(tool)}
          onDeselect={() => onToolDeselect(tool.id)}
        />
      ))}
    </div>
  );
};
