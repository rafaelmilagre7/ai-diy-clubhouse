import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tool {
  name: string;
  category: string;
  reason: string;
}

interface RequiredToolsGridProps {
  tools: {
    essential?: Tool[];
    optional?: Tool[];
  };
}

export const RequiredToolsGrid: React.FC<RequiredToolsGridProps> = ({ tools }) => {
  const essentialTools = tools?.essential || [];
  const optionalTools = tools?.optional || [];

  const ToolCard = ({ tool, isEssential }: { tool: Tool; isEssential: boolean }) => (
    <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isEssential ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{tool.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {tool.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tool.reason}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Essenciais */}
      {essentialTools.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Essenciais</h4>
            <Badge variant="default" className="text-xs">
              {essentialTools.length}
            </Badge>
          </div>
          <div className="grid gap-3">
            {essentialTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ToolCard tool={tool} isEssential={true} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Opcionais */}
      {optionalTools.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Opcionais</h4>
            <Badge variant="secondary" className="text-xs">
              {optionalTools.length}
            </Badge>
          </div>
          <div className="grid gap-3">
            {optionalTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (essentialTools.length + index) * 0.05 }}
              >
                <ToolCard tool={tool} isEssential={false} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {essentialTools.length === 0 && optionalTools.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma ferramenta especificada
        </p>
      )}
    </div>
  );
};
