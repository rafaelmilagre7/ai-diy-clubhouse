import React from 'react';
import { ToolCardBuilder } from './ToolCardBuilder';

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
    <div className="space-y-8">
      {/* Essenciais */}
      {essentialTools.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-foreground">
            Ferramentas Essenciais 
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({essentialTools.length})
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentialTools.map((tool, index) => (
              <ToolCardBuilder 
                key={index}
                tool={tool} 
                isEssential={true}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opcionais */}
      {optionalTools.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-foreground">
            Ferramentas Opcionais
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({optionalTools.length})
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optionalTools.map((tool, index) => (
              <ToolCardBuilder 
                key={index}
                tool={tool} 
                isEssential={false}
                index={essentialTools.length + index}
              />
            ))}
          </div>
        </div>
      )}

      {essentialTools.length === 0 && optionalTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma ferramenta especificada
          </p>
        </div>
      )}
    </div>
  );
};
