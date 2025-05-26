
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForumHeaderProps {
  title: string;
  description: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
}

export const ForumHeader = ({ 
  title, 
  description, 
  showNewTopicButton = true,
  categorySlug 
}: ForumHeaderProps) => {
  const newTopicPath = categorySlug ? `/comunidade/novo-topico/${categorySlug}` : '/comunidade/novo-topico';

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
          
          {showNewTopicButton && (
            <Button asChild>
              <Link to={newTopicPath}>
                <Plus className="h-4 w-4 mr-2" />
                Novo tópico
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
