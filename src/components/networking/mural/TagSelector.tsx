import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OPPORTUNITY_TAGS, TAG_CATEGORIES, MAX_TAGS, OpportunityTag } from '@/constants/opportunityTags';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagSelector = ({ selectedTags, onChange }: TagSelectorProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('setor');

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else if (selectedTags.length < MAX_TAGS) {
      onChange([...selectedTags, tagId]);
    }
  };

  const getTagsByCategory = (category: string) => {
    return OPPORTUNITY_TAGS.filter((tag) => tag.category === category);
  };

  const selectedTagsData = OPPORTUNITY_TAGS.filter((tag) => selectedTags.includes(tag.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Tags da Oportunidade</Label>
        <span className="text-sm text-muted-foreground">
          {selectedTags.length}/{MAX_TAGS} selecionadas
        </span>
      </div>

      {/* Selected Tags Display */}
      <AnimatePresence mode="popLayout">
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedTagsData.map((tag) => {
              const Icon = tag.icon;
              return (
                <motion.div
                  key={tag.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Badge
                    variant="default"
                    className="gap-1.5 pl-2 pr-1.5 py-1.5 text-sm bg-gradient-to-r from-aurora to-viverblue"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Categories */}
      <div className="space-y-3">
        {Object.entries(TAG_CATEGORIES).map(([categoryKey, categoryLabel]) => {
          const categoryTags = getTagsByCategory(categoryKey);
          const isExpanded = expandedCategory === categoryKey;

          return (
            <div key={categoryKey} className="liquid-glass-card p-4 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                className="w-full flex items-center justify-between text-left mb-3"
              >
                <span className="font-medium text-sm text-foreground/90">{categoryLabel}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {categoryTags.map((tag) => {
                      const Icon = tag.icon;
                      const isSelected = selectedTags.includes(tag.id);
                      const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS;

                      return (
                        <motion.button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          className={cn(
                            'relative flex items-center gap-2 p-3 rounded-lg border transition-all duration-200',
                            'hover:shadow-md',
                            isSelected
                              ? 'border-aurora/40 bg-gradient-to-br from-aurora/10 to-viverblue/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20',
                            isDisabled && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-full transition-all',
                              isSelected
                                ? 'bg-gradient-to-br from-aurora to-viverblue text-white'
                                : 'bg-white/10 text-muted-foreground'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium flex-1 text-left">{tag.label}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-gradient-to-br from-aurora to-viverblue rounded-full p-1"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
