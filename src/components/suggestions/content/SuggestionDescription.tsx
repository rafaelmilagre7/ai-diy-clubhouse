
import React from 'react';

interface SuggestionDescriptionProps {
  description: string;
}

const SuggestionDescription = ({ description }: SuggestionDescriptionProps) => {
  return (
    <div className="prose prose-sm max-w-none text-textPrimary">
      <p className="whitespace-pre-line leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default SuggestionDescription;
