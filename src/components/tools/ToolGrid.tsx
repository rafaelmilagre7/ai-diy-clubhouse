
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
        <p className="text-muted-foreground">Nenhuma ferramenta encontrada.</p>
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
    <Card className="relative flex flex-col h-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl group hover:bg-white/8 transition-all duration-500">
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '15px 15px'
        }} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/15 to-viverblue-dark/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative flex flex-col h-full">
        <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-viverblue/10 border border-viverblue/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    parent.innerHTML = `<div class="text-xl font-bold text-viverblue-light">${tool.name.substring(0, 2).toUpperCase()}</div>`;
                  }
                }}
              />
            ) : (
              <div className="text-xl font-bold text-viverblue-light">
                {tool.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">{tool.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue-light border-viverblue/20 hover:bg-viverblue/15 transition-colors">
                {tool.category}
              </Badge>
              {tool.has_member_benefit && tool.benefit_type && (
                <BenefitBadge type={tool.benefit_type} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 flex-1">
          <p className="text-neutral-300 line-clamp-3 text-sm leading-relaxed">
            {tool.description}
          </p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-2 flex justify-between">
          <Link to={`/tools/${tool.id}`}>
            <Button variant="outline" size="sm" className="bg-viverblue/10 hover:bg-viverblue/20 text-viverblue-light border-viverblue/20 hover:border-viverblue/30 transition-all duration-300">
              Ver detalhes
            </Button>
          </Link>
          <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="text-viverblue-light hover:text-white hover:bg-viverblue/20 transition-all duration-300">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardFooter>
      </div>
    </Card>
  );
};

export { ToolCard };
