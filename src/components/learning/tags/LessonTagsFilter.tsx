import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLessonTagsByCategory } from '@/hooks/useLessonTags';
import { LessonTag } from '@/lib/supabase/types/learning';
import { TagBadge } from './TagBadge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface LessonTagsFilterProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

export const LessonTagsFilter: React.FC<LessonTagsFilterProps> = ({
  selectedTagIds,
  onTagsChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { tagsByCategory, isLoading } = useLessonTagsByCategory();

  // Filtrar tags por busca
  const filteredTagsByCategory = Object.entries(tagsByCategory).reduce((acc, [category, tags]) => {
    const filteredTags = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredTags.length > 0) {
      acc[category] = filteredTags;
    }
    return acc;
  }, {} as Record<string, LessonTag[]>);

  // Obter tags selecionadas
  const selectedTags = Object.values(tagsByCategory)
    .flat()
    .filter(tag => selectedTagIds.includes(tag.id));

  const handleTagClick = (tag: LessonTag) => {
    let updatedTagIds: string[];
    
    if (selectedTagIds.includes(tag.id)) {
      // Remover tag
      updatedTagIds = selectedTagIds.filter(id => id !== tag.id);
    } else {
      // Adicionar tag
      updatedTagIds = [...selectedTagIds, tag.id];
    }
    
    onTagsChange(updatedTagIds);
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTagIds = selectedTagIds.filter(id => id !== tagId);
    onTagsChange(updatedTagIds);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Carregando tags...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtrar por Tags
          {selectedTagIds.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedTagIds.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tags Selecionadas */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Tags selecionadas:</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllTags}
                className="text-xs h-6 px-2"
              >
                Limpar tudo
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <TagBadge tag={tag} size="sm" />
                  <button
                    className="ml-1 p-1 hover:bg-destructive/10 rounded-full transition-colors"
                    onClick={() => handleRemoveTag(tag.id)}
                  >
                    <X className="h-3 w-3 hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Tags por Categoria */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">
                {isExpanded ? 'Ocultar tags' : 'Mostrar todas as tags'}
              </span>
              <Tag className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {Object.entries(filteredTagsByCategory).map(([category, tags]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag)}
                      className="transition-all hover:scale-105"
                    >
                      <TagBadge 
                        tag={tag} 
                        size="sm" 
                        variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                        clickable
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(filteredTagsByCategory).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchTerm ? 'Nenhuma tag encontrada para sua busca.' : 'Nenhuma tag disponível.'}
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {selectedTagIds.length === 0 && !isExpanded && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Clique em "Mostrar todas as tags" para filtrar aulas
          </p>
        )}
      </CardContent>
    </Card>
  );
};