import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TemplateCardProps {
  template: any;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      APPROVED: 'default',
      PENDING: 'secondary', 
      REJECTED: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKETING': return '📢';
      case 'UTILITY': return '🔧';
      case 'AUTHENTICATION': return '🔐';
      default: return '📋';
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(template.category)}</span>
          <h4 className="font-semibold">{template.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(template.status)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Menos' : 'Mais'}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-2">
        <span>Categoria: {template.category}</span>
        {template.language && (
          <span className="ml-4">Idioma: {template.language}</span>
        )}
      </div>
      
      {expanded && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
          <h5 className="font-semibold mb-2 text-foreground">Componentes:</h5>
          {template.components?.map((component: any, index: number) => (
            <div key={index} className="mb-2 p-2 bg-card rounded border-l-2 border-primary">
              <div className="font-medium text-sm text-foreground">{component.type.toUpperCase()}</div>
              {component.text && (
                <div className="text-sm mt-1 text-muted-foreground">{component.text}</div>
              )}
              {component.buttons && (
                <div className="text-sm mt-1 text-muted-foreground">
                  <strong>Botões:</strong> {component.buttons.map((b: any) => b.text).join(', ')}
                </div>
              )}
            </div>
          ))}
          
          {template.quality_score && (
            <div className="mt-2">
              <span className="text-sm font-medium text-foreground">Qualidade: </span>
              <Badge variant="outline">{template.quality_score.score}</Badge>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};