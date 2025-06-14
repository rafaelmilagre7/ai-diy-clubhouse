
import React, { memo } from 'react';

interface CardContentSectionProps {
  title: string;
  description: string;
}

// Componente memoizado para conteúdo do card
export const CardContentSection = memo<CardContentSectionProps>(({ title, description }) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white leading-tight">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
        {description}
      </p>
    </div>
  );
});

CardContentSection.displayName = 'CardContentSection';
