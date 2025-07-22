
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardTitle, CardDescription } from '@/components/ui/card';

interface SuggestionTitleProps {
  title: string;
  category?: { name: string };
  createdAt: string;
  isOwner?: boolean;
}

const SuggestionTitle = ({ 
  title, 
  category, 
  createdAt, 
  isOwner 
}: SuggestionTitleProps) => {
  const formattedDate = format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-4 flex-1">
      <div>
        <CardTitle className="text-3xl font-semibold text-foreground leading-tight">
          {title}
        </CardTitle>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {category?.name && (
          <Badge 
            variant="secondary" 
            className="bg-muted/50 text-foreground border-border px-3 py-1 rounded-full"
          >
            {category.name}
          </Badge>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        
        {isOwner && (
          <Badge 
            variant="outline" 
            className="border-primary/50 text-primary bg-primary/10 px-3 py-1 rounded-full"
          >
            Sua sugestão
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SuggestionTitle;
