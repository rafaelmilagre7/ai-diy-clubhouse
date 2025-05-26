
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForumHeaderProps {
  title: string;
  description?: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
}

export const ForumHeader: React.FC<ForumHeaderProps> = ({ 
  title, 
  description,
  showNewTopicButton = true,
  categorySlug 
}) => {
  const navigate = useNavigate();

  const handleNewTopic = () => {
    if (categorySlug) {
      navigate(`/comunidade/novo-topico/${categorySlug}`);
    } else {
      navigate('/comunidade/novo-topico');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {showNewTopicButton && (
        <Button onClick={handleNewTopic} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Tópico
        </Button>
      )}
    </div>
  );
};
