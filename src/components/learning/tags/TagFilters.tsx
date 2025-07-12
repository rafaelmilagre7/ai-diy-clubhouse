import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TagBadge } from './TagBadge';
import { useLessonTagsByCategory } from '@/hooks/useLessonTags';
import { LessonTag } from '@/lib/supabase/types/learning';
import { cn } from '@/lib/utils';

interface TagFiltersProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  lessonCounts?: Record<string, number>;
  className?: string;
}

export const TagFilters: React.FC<TagFiltersProps> = ({
  selectedTags,
  onTagsChange,
  lessonCounts = {},
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { tagsByCategory, isLoading } = useLessonTagsByCategory();

  const filteredTagsByCategory = Object.entries(tagsByCategory).reduce((acc, [category, tags]) => {
    const filtered = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, LessonTag[]>);

  const handleTagClick = (tag: LessonTag) => {
    const isSelected = selectedTags.includes(tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(id => id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag.id]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/6"></div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-muted rounded-full w-16"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtrar por Tags</h3>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllTags}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar ({selectedTags.length})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Tags Selecionadas:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = Object.values(tagsByCategory).flat().find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <div className="relative">
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    size="sm"
                    clickable
                    onClick={() => handleTagClick(tag)}
                    className="pr-8"
                  />
                  <X className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 cursor-pointer" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags by Category */}
      <div className="space-y-4">
        {Object.entries(filteredTagsByCategory).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground capitalize">
              {category}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                const count = lessonCounts[tag.id] || 0;
                
                return (
                  <div key={tag.id} className="relative">
                    <TagBadge
                      tag={tag}
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      clickable
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        isSelected && 'ring-2 ring-offset-2 ring-primary/50'
                      )}
                    />
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {searchTerm && Object.keys(filteredTagsByCategory).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma tag encontrada para "{searchTerm}"</p>
        </div>
      )}
    </Card>
  );
};