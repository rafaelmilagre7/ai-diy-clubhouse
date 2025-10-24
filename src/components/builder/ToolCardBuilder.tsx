import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

interface ToolCardBuilderProps {
  tool: {
    name: string;
    logo_url?: string;
    category: string;
    reason: string;
    setup_complexity?: string;
    cost_estimate?: string;
    tool_id?: string;
  };
  isEssential: boolean;
  index: number;
}

// Traduzir complexidade de setup para PT-BR
const translateComplexity = (complexity?: string): string => {
  if (!complexity) return '';
  const translations: Record<string, string> = {
    'easy': 'Fácil',
    'medium': 'Médio',
    'hard': 'Difícil'
  };
  return translations[complexity.toLowerCase()] || complexity;
};

export const ToolCardBuilder: React.FC<ToolCardBuilderProps> = ({ tool, isEssential, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-border/50 bg-surface-elevated/50 backdrop-blur-sm transition-all duration-300 hover:shadow-aurora hover:border-aurora/40 hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--aurora) / 0.15) 1px, transparent 0)',
          backgroundSize: '15px 15px'
        }} />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-aurora/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-xl bg-surface-overlay border border-border/50 group-hover:border-aurora/50 flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-200">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={`Logo ${tool.name}`}
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-xl font-bold text-primary">${tool.name.substring(0, 2).toUpperCase()}</div>`;
                  }
                }}
              />
            ) : (
              <div className="text-xl font-bold text-primary">
                {tool.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <h4 className="text-lg font-bold mb-2 group-hover:text-aurora transition-colors duration-200">
            {tool.name}
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant="outline" 
              className="text-xs border-border/50 text-text-muted group-hover:border-aurora/30 group-hover:text-aurora transition-all duration-200"
            >
              {tool.category}
            </Badge>
            {isEssential && (
              <Badge 
                variant="default" 
                className="text-xs bg-aurora/20 text-aurora border-aurora/40 border"
              >
                Essencial
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-grow text-center group-hover:text-text-primary transition-colors duration-200">
          {tool.reason}
        </p>

        {/* Link para ferramenta na plataforma */}
        {tool.tool_id && (
          <div className="mb-4">
            <a 
              href={APP_CONFIG.getAppUrl(`/ferramentas/${tool.tool_id}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors gap-2"
            >
              Ver na plataforma
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Metadata Footer */}
        {(tool.setup_complexity || tool.cost_estimate) && (
          <div className="flex flex-wrap gap-2 justify-center pt-4 mt-auto border-t border-border/30">
            {tool.setup_complexity && (
              <Badge variant="outline" className="text-xs">
                Setup: {translateComplexity(tool.setup_complexity)}
              </Badge>
            )}
            {tool.cost_estimate && (
              <Badge variant="outline" className="text-xs">
                {tool.cost_estimate}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
