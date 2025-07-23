import React from 'react';
import { ToolCard } from './ToolCard';
import { SpecialOptionCard } from './SpecialOptionCard';
import { AITool, getToolsByCategory, SPECIAL_OPTIONS } from '@/data/aiTools';

interface ToolGridProps {
  selectedTools: string[];
  onToolToggle: (toolName: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ selectedTools, onToolToggle }) => {
  const toolsByCategory = getToolsByCategory();

  return (
    <div className="space-y-6">
      {/* Categorias de Ferramentas */}
      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">{category}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isSelected={selectedTools.includes(tool.name)}
                onToggle={onToolToggle}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Opções Especiais */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Opções especiais</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SPECIAL_OPTIONS.map((option) => (
            <SpecialOptionCard
              key={option.id}
              name={option.name}
              icon={option.icon}
              isSelected={selectedTools.includes(option.name)}
              onToggle={onToolToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};