
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimplifiedTool } from '@/lib/supabase/types';

interface CategoryGridProps {
  tools: SimplifiedTool[];
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

export const CategoryGrid = ({ tools, selectedCategory, onCategoryChange }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <Link to={`/tools/${tool.id}`} key={tool.id}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 flex flex-col items-center">
              {tool.logo_url && (
                <div className="h-16 w-16 mb-2 rounded-full overflow-hidden">
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <h3 className="text-md font-semibold text-center">{tool.name}</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                {tool.description?.substring(0, 50)}...
              </p>
              <Badge 
                variant="outline" 
                className={`ml-2 ${tool.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {tool.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
