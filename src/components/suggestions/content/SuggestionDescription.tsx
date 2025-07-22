
import React from 'react';

interface SuggestionDescriptionProps {
  description: string;
}

const SuggestionDescription = ({ description }: SuggestionDescriptionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Descrição</h3>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
};

export default SuggestionDescription;
