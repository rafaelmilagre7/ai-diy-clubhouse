import React, { useState } from 'react';
import { Check, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const OPPORTUNITY_TAGS = [
  'Tecnologia',
  'Marketing',
  'Vendas',
  'Finanças',
  'RH',
  'Logística',
  'Produção',
  'Consultoria',
  'E-commerce',
  'SaaS',
  'Indústria',
  'Varejo',
  'Serviços',
  'Startup',
  'Inovação',
];

interface TagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagsFilter: React.FC<TagsFilterProps> = ({
  selectedTags,
  onTagsChange,
}) => {
  const [open, setOpen] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all"
          >
            <Tag className="w-4 h-4 mr-2" />
            Tags
            {selectedTags.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-primary/20 text-primary border-none"
              >
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-card/95 backdrop-blur-xl border-border/50" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filtrar por tags</h4>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs"
                >
                  Limpar tudo
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto scrollbar-thin">
              {OPPORTUNITY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                      'border backdrop-blur-sm',
                      isSelected
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'bg-card/50 border-border/50 hover:border-border hover:bg-card/80'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3" />}
                      {tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 pl-2 pr-1"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
