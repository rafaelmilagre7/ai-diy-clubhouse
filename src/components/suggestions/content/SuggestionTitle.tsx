
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusColor, formatRelativeDate } from '@/utils/suggestionUtils';

interface SuggestionTitleProps {
  title: string;
  category?: { name: string };
  createdAt: string;
  isOwner?: boolean;
  status?: string;
}

const SuggestionTitle = ({ 
  title, 
  category, 
  createdAt, 
  isOwner = false,
  status = 'new'
}: SuggestionTitleProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {category?.name && (
          <Badge variant="secondary" className="text-xs">
            {category.name}
          </Badge>
        )}
        <Badge 
          variant="secondary" 
          className={`text-xs ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </Badge>
        {isOwner && (
          <Badge variant="outline" className="text-xs border-viverblue text-viverblue">
            Sua sugestão
          </Badge>
        )}
      </div>
      
      <h1 className="text-2xl font-bold text-textPrimary leading-tight">
        {title}
      </h1>
      
      <p className="text-sm text-textSecondary">
        Criada {formatRelativeDate(createdAt)}
      </p>
    </div>
  );
};

export default SuggestionTitle;
