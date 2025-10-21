import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { ToolCard } from './ToolCard';

interface Tool {
  name: string;
  logo_url?: string;
  category: string;
  reason: string;
  setup_complexity?: string;
  cost_estimate?: string;
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

  return (
    <div className="space-y-6">
      {/* Essenciais */}
      {essentialTools.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Ferramentas Essenciais ({essentialTools.length})</h4>
          <div className="grid gap-4">
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
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Ferramentas Opcionais ({optionalTools.length})</h4>
          <div className="grid gap-4">
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
