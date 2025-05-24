
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Users } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  onClick?: () => void;
}

export const CategoryCard = ({ 
  name, 
  description, 
  onClick 
}: CategoryCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>0</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        {description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>0 tópicos</span>
          <span>0 mensagens</span>
        </div>
      </CardContent>
    </Card>
  );
};
