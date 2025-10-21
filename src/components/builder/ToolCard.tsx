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
    <LiquidGlassCard className="p-6 hover:shadow-lg transition-all hover:border-primary/40">
      {/* Header com Logo */}
      <div className="flex items-start gap-4 mb-4">
        {tool.logo_url && (
          <div className="flex-shrink-0">
            <img 
              src={tool.logo_url} 
              alt={`Logo ${tool.name}`}
              className="w-20 h-20 object-contain rounded-full bg-white/10 p-3 border border-white/20 shadow-sm"
              onError={(e) => {
                // Fallback se logo não carregar
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-lg font-bold">{tool.name}</h4>
            {isEssential && (
              <Badge variant="default" className="flex-shrink-0">
                Essencial
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{tool.category}</p>
        </div>
      </div>

      {/* Reason */}
      <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
        {tool.reason}
      </p>

      {/* Metadata */}
      {(tool.setup_complexity || tool.cost_estimate) && (
        <div className="flex flex-wrap gap-2">
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