
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { ForumCategory } from '@/lib/supabase/types/forum.types';
import { MessageSquare } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: ForumCategory;
  topicCount?: number;
  lastActivity?: string;
}

export const CategoryCard = ({ category, topicCount = 0, lastActivity }: CategoryCardProps) => {
  // Função para obter o ícone dinamicamente por nome
  const getIconComponent = (iconName: string): LucideIcon => {
    return (LucideIcons as any)[iconName] || MessageSquare;
  };
  
  // Componente de ícone dinâmico baseado no nome do ícone armazenado
  const IconComponent = category.icon ? getIconComponent(category.icon) : MessageSquare;

  return (
    <Card className="transition-all hover:shadow-md">
      <Link to={`/forum/categoria/${category.slug}`} className="block h-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">{category.name}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-between items-center pt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> 
            {topicCount} {topicCount === 1 ? 'tópico' : 'tópicos'}
          </Badge>
          
          {lastActivity && (
            <span className="text-xs text-muted-foreground">
              Última atividade: {new Date(lastActivity).toLocaleDateString('pt-BR')}
            </span>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};
