
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForumHeaderProps {
  title: string;
  description?: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
}

export const ForumHeader = ({ title, description, showNewTopicButton = false, categorySlug }: ForumHeaderProps) => {
  const newTopicPath = categorySlug ? `/comunidade/novo-topico/${categorySlug}` : '/comunidade/novo-topico';
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {showNewTopicButton && (
        <Button asChild>
          <Link to={newTopicPath}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Link>
        </Button>
      )}
    </div>
  );
};
