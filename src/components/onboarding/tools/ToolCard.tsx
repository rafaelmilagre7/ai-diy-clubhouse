import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AITool } from '@/data/aiTools';

interface ToolCardProps {
  tool: AITool;
  isSelected: boolean;
  onToggle: (toolName: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isSelected, onToggle }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.log('[TOOL_CARD] ❌ Erro ao carregar imagem:', tool.name);
    setImageError(true);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
        isSelected 
          ? 'border-2 border-primary bg-primary/10 shadow-lg' 
          : 'border border-border hover:bg-accent/50'
      }`}
      onClick={() => {
        console.log('[TOOL_CARD] 🎯 Clique em:', tool.name);
        onToggle(tool.name);
      }}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
            {imageError ? (
              <div className="text-xs font-medium text-primary flex items-center justify-center w-full h-full">
                {tool.name.charAt(0)}
              </div>
            ) : (
              <img 
                src={tool.logo_url} 
                alt={`${tool.name} logo`}
                className="w-6 h-6 object-contain"
                onError={handleImageError}
              />
            )}
          </div>
        </div>
        <span className="text-sm font-medium flex-1 text-left ml-2">
          {tool.name}
        </span>
        <Checkbox
          checked={isSelected}
          onChange={() => {}} // Apenas visual
          className="pointer-events-none"
        />
      </CardContent>
    </Card>
  );
};