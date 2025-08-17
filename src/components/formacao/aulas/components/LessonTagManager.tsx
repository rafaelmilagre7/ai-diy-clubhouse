import { useState } from 'react';
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
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
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
        color: '#6366f1', // Cor padrão
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
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
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Adicionar tags:</h4>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar tags...
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-card border" align="start">
              <Command>
                <CommandInput
                  placeholder="Buscar tags..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList className="max-h-60">
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">Nenhuma tag encontrada</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowCreateTag(true)}
                        type="button"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Criar nova tag
                      </Button>
                    </div>
                  </CommandEmpty>
                  
                  {Object.entries(filteredTagsByCategory).map(([category, tags]) => (
                    <CommandGroup key={category} heading={category}>
                      {tags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            handleTagSelect(tag);
                            setSearchTerm('');
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <TagBadge 
                            tag={tag} 
                            size="sm" 
                            variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                          />
                          {tag.description && (
                            <span className="text-xs text-muted-foreground">
                              {tag.description}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                  
                  {Object.keys(filteredTagsByCategory).length > 0 && (
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setShowCreateTag(true)}
                        className="flex items-center gap-2 cursor-pointer border-t"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Criar nova tag</span>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Criar Nova Tag */}
        {showCreateTag && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 space-y-4">
              <h4 className="text-sm font-medium">Criar nova tag:</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Nome da tag</label>
                  <Input
                    placeholder="Ex: Marketing Digital"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">Categoria</label>
                  <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border">
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
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={createTagMutation.isPending}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Criar Tag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTag(false)}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma tag selecionada. Use as tags para categorizar esta aula.
          </p>
        )}
      </CardContent>
    </Card>
  );
};