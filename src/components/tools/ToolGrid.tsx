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
    <Card className="flex flex-col h-full border overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4 relative">
        <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool.name} 
              className="h-full w-full object-contain" 
            />
          ) : (
            <div className="text-xl font-bold text-[#0ABAB5]">
              {tool.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{tool.name}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
              {tool.category}
            </Badge>
            {tool.has_member_benefit && tool.benefit_type && (
              <BenefitBadge type={tool.benefit_type} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 flex-1">
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {tool.description}
        </p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-2 flex justify-between">
        <Link to={`/tools/${tool.id}`}>
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
        </Link>
        <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost" className="text-[#0ABAB5]">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
};
