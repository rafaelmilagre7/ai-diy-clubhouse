
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare, PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  topicCount?: number;
  userCount?: number;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  description,
  slug,
  icon,
  topicCount = 0,
  userCount = 0,
  onClick
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-muted-foreground">
          {description || `Discussões relacionadas a ${name}`}
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 pt-4">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessagesSquare className="h-4 w-4" /> 
            <span>{topicCount} tópicos</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" /> 
            <span>{userCount} usuários</span>
          </div>
        </div>
        
        <div className="flex space-x-2 w-full">
          <Button 
            asChild 
            variant="outline" 
            className="w-full"
            onClick={onClick}
          >
            <Link to={`/comunidade/categoria/${slug}`}>
              Visualizar
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="default" 
            size="icon"
            onClick={onClick}
          >
            <Link to={`/comunidade/novo-topico/${slug}`}>
              <PlusCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
