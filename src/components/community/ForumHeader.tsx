
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForumHeaderProps {
  title: string;
  description: string;
  showNewTopicButton?: boolean;
}

export const ForumHeader: React.FC<ForumHeaderProps> = ({ 
  title, 
  description, 
  showNewTopicButton = true 
}) => {
  return (
    <div className="bg-white border-b">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
          
          {showNewTopicButton && (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/comunidade/novo-topico">
                <Plus className="h-5 w-5 mr-2" />
                Novo Tópico
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
