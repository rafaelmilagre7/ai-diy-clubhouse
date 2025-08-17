
import React from 'react';
import { Tool } from '@/types/toolTypes';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BenefitBadge } from './BenefitBadge';

interface ToolGridProps {
  tools: Tool[];
}

export const ToolGrid = ({ tools }: ToolGridProps) => {
  if (tools.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted">Nenhuma ferramenta encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <Card className="relative flex flex-col h-full overflow-hidden group surface-elevated transition-all duration-300 hover:shadow-aurora hover:border-aurora/30 hover:scale-[1.02] hover:-translate-y-1">
      {/* Subtle dots pattern com aurora theme */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--aurora) / 0.1) 1px, transparent 0)',
          backgroundSize: '15px 15px'
        }} />
      </div>
      
      {/* Aurora glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-aurora/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex flex-col h-full">
        <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-lg bg-surface-overlay border border-border/50 group-hover:border-aurora/50 flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-200">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={tool.name} 
                className="h-full w-full object-contain" 
                onError={(e) => {
                  console.error(`Erro ao carregar logo: ${tool.logo_url}`);
                  e.currentTarget.src = "";
                  e.currentTarget.classList.add("hidden");
                  const parent = e.currentTarget.parentElement;
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
          <div>
            <h3 className="text-heading-3 line-clamp-1 group-hover:text-aurora transition-colors duration-200">{tool.name}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="border-border/50 text-text-muted group-hover:border-aurora/30 group-hover:text-aurora transition-all duration-200">
                {tool.category}
              </Badge>
              {tool.has_member_benefit && tool.benefit_type && (
                <BenefitBadge type={tool.benefit_type} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 flex-1 relative z-10">
          <p className="text-body-small text-text-secondary line-clamp-3 leading-relaxed group-hover:text-text-primary transition-colors duration-200">
            {tool.description}
          </p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-2 flex justify-between relative z-10">
          <Link to={`/tools/${tool.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border/50 hover:border-aurora hover:bg-aurora/10 hover:text-aurora transition-all duration-200"
            >
              Ver detalhes
            </Button>
          </Link>
          <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
            <Button 
              size="sm" 
              variant="ghost" 
              className="hover:bg-aurora/10 hover:text-aurora transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardFooter>
      </div>
    </Card>
  );
};

export { ToolCard };
