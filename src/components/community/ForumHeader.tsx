
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForumHeaderProps {
  title: string;
  description?: string;
  showNewTopicButton?: boolean;
}

export const ForumHeader = ({ title, description, showNewTopicButton = false }: ForumHeaderProps) => {
  const navigate = useNavigate();

  const handleNewTopic = () => {
    console.log('Navegando para novo tópico...');
    navigate('/comunidade/novo-topico');
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {showNewTopicButton && (
            <Button onClick={handleNewTopic} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo tópico
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
