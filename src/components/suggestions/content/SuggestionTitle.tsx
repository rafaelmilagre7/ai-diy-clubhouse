
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>
          {category?.name && (
            <Badge variant="outline" className="mr-2">{category.name}</Badge>
          )}
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar size={14} />
            {formattedDate}
          </span>
          {isOwner && (
            <Badge variant="secondary" className="ml-2">Sua sugestão</Badge>
          )}
        </CardDescription>
      </div>
    </div>
  );
};

export default SuggestionTitle;
