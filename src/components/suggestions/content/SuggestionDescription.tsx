
import React from 'react';

interface SuggestionDescriptionProps {
  description: string;
}

const SuggestionDescription = ({ description }: SuggestionDescriptionProps) => {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <p className="whitespace-pre-line">{description}</p>
    </div>
  );
};

export default SuggestionDescription;
