import React from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: {
    name: string;
    logo_url?: string;
    category: string;
    reason: string;
    setup_complexity?: string;
    cost_estimate?: string;
  };
  isEssential: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isEssential }) => {
  return (
    <LiquidGlassCard className="p-6 hover:shadow-lg transition-all hover:border-cyan-400/40 relative flex flex-col h-full">
      {/* Badge Essencial - Posicionado no topo direito */}
      {isEssential && (
        <Badge variant="default" className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
          Essencial
        </Badge>
      )}

      {/* Logo centralizado */}
      {tool.logo_url && (
        <div className="flex justify-center mb-4">
          <img 
            src={tool.logo_url} 
            alt={`Logo ${tool.name}`}
            className="w-20 h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-3">
        <h4 className="text-lg font-bold mb-1">{tool.name}</h4>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{tool.category}</p>
      </div>

      {/* Reason */}
      <p className="text-sm text-foreground/80 mb-4 leading-relaxed flex-grow text-center">
        {tool.reason}
      </p>

      {/* Metadata */}
      {(tool.setup_complexity || tool.cost_estimate) && (
        <div className="flex flex-wrap gap-2 justify-center mt-auto pt-4 border-t border-border/50">
          {tool.setup_complexity && (
            <Badge variant="outline" className="text-xs">
              Setup: {tool.setup_complexity}
            </Badge>
          )}
          {tool.cost_estimate && (
            <Badge variant="outline" className="text-xs">
              {tool.cost_estimate}
            </Badge>
          )}
        </div>
      )}
    </LiquidGlassCard>
  );
};