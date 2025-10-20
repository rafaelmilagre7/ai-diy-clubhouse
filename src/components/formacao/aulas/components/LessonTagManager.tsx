import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Tag } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useLessonTagsByCategory, useCreateTag } from '@/hooks/useLessonTags';
import { LessonTag } from '@/lib/supabase/types/learning';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { TagBadge } from '@/components/learning/tags/TagBadge';
import { toast } from 'sonner';

interface LessonTagManagerProps {
  form: UseFormReturn<any>;
  fieldName?: string;
}

export const LessonTagManager = ({ form, fieldName = 'tags' }: LessonTagManagerProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);
  
  const { tagsByCategory, isLoading } = useLessonTagsByCategory();
  const createTagMutation = useCreateTag();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const selectedTagIds = form.watch(fieldName) || [];

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

  const handleTagSelect = (tag: LessonTag) => {
    const currentTags = selectedTagIds || [];
    let updatedTags: string[];
    
    if (currentTags.includes(tag.id)) {
      // Remover tag
      updatedTags = currentTags.filter((id: string) => id !== tag.id);
    } else {
      // Adicionar tag
      updatedTags = [...currentTags, tag.id];
    }
    
    form.setValue(fieldName, updatedTags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTagIds.filter((id: string) => id !== tagId);
    form.setValue(fieldName, updatedTags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Nome da tag é obrigatório');
      return;
    }

    if (!newTagCategory.trim()) {
      toast.error('Categoria é obrigatória');
      return;
    }

    try {
      const newTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        category: newTagCategory,
        description: `Tag ${newTagName}`,
        color: 'hsl(var(--primary))',
        order_index: 0,
        is_active: true
      });

      // Adicionar nova tag às selecionadas
      const currentTags = selectedTagIds || [];
      const updatedTags = [...currentTags, newTag.id];
      form.setValue(fieldName, updatedTags, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });

      // Limpar formulário de criação
      setNewTagName('');
      setNewTagCategory('');
      setShowCreateTag(false);
      
      toast.success('Tag criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar tag');
    }
  };

  const categories = Object.keys(tagsByCategory);

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Tags da Aula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags Selecionadas */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags selecionadas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <TagBadge tag={tag} size="sm" />
                    <button
                      type="button"
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

          {/* Seletor de Tags */}
          <div className="space-y-2 w-full">
            <h4 className="text-sm font-medium">Adicionar tags:</h4>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-10"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Buscar tags...
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] max-w-[95vw] min-w-mobile p-0 bg-popover border shadow-lg z-[200]" 
                align="start"
                side="bottom"
                sideOffset={4}
              style={{ 
                maxHeight: 'min(500px, 85vh)',
                overflowY: 'hidden'
              }}
            >
              <div className="flex flex-col max-h-modal-md bg-popover rounded-md overflow-hidden">
                {/* Header fixo com busca */}
                <div className="flex-shrink-0 p-3 border-b border-border bg-popover sticky top-0 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Buscar tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 bg-background border-border focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Área scrollável com as tags (nativa, com suporte a trackpad) */}
                <div className="flex-1 bg-popover">
                  <div
                    ref={scrollRef}
                    className="h-scroll-md px-1 overflow-y-auto"
                      onWheel={(e) => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollTop += e.deltaY
                        }
                        e.stopPropagation()
                      }}
                      onWheelCapture={(e) => e.stopPropagation()}
                      style={{ WebkitOverflowScrolling: 'touch' }}
                      role="listbox"
                      aria-label="Lista de tags"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Carregando tags...</div>
                        </div>
                      ) : Object.keys(filteredTagsByCategory).length === 0 ? (
                        <div className="py-6 text-center px-2">
                          <p className="text-sm text-muted-foreground mb-3">
                            {searchTerm ? 'Nenhuma tag encontrada para essa busca' : 'Nenhuma tag disponível'}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setShowCreateTag(true);
                              setOpen(false);
                            }}
                            type="button"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar nova tag
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 p-2 pr-3">
                          {Object.entries(filteredTagsByCategory)
                            .filter(([_, tags]) => Array.isArray(tags) && tags.length > 0)
                            .map(([category, tags]) => (
                              <div key={category} className="space-y-2">
                                {/* Cabeçalho da categoria */}
                                <div className="px-2 py-1 bg-muted/50 rounded-sm sticky top-0">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {category} ({tags.length})
                                  </h4>
                                </div>
                                {/* Tags da categoria */}
                                <div className="grid gap-1 px-1">
                                  {tags.filter(tag => tag && tag.id).map((tag) => (
                                    <button
                                      key={tag.id}
                                      type="button"
                                      onClick={() => {
                                        handleTagSelect(tag);
                                        setSearchTerm('');
                                        setOpen(false);
                                      }}
                                      className={`w-full px-3 py-2 text-left rounded-md transition-all duration-200 flex items-center gap-2 group ${
                                        selectedTagIds.includes(tag.id) 
                                          ? 'bg-primary/10 border border-primary/20 text-primary' 
                                          : 'hover:bg-accent hover:text-accent-foreground border border-transparent'
                                      }`}
                                    >
                                      <TagBadge 
                                        tag={tag} 
                                        size="sm" 
                                        variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                                      />
                                      {tag.description && (
                                        <span className="text-xs text-muted-foreground truncate flex-1 group-hover:text-foreground">
                                          {tag.description}
                                        </span>
                                      )}
                                      {selectedTagIds.includes(tag.id) && (
                                        <span className="text-xs text-primary font-medium">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer fixo com botão de criar */}
                  <div className="flex-shrink-0 p-3 border-t border-border bg-popover sticky bottom-0 z-10">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-9 hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setShowCreateTag(true);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="text-sm">Criar nova tag</span>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Criar Nova Tag */}
          {showCreateTag && (
            <Card className="border-2 border-dashed border-primary/20 bg-muted/20">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Criar nova tag:</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateTag(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Nome da tag</label>
                    <Input
                      placeholder="Ex: Marketing Digital"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Categoria</label>
                    <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-[100]">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="Geral">Nova Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={createTagMutation.isPending}
                    size="sm"
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createTagMutation.isPending ? 'Criando...' : 'Criar Tag'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateTag(false)}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTags.length === 0 && !showCreateTag && (
            <div className="text-center py-4 px-4 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Nenhuma tag selecionada. Use as tags para categorizar esta aula e facilitar a busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};