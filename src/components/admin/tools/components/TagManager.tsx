
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';

interface TagManagerProps {
  form: UseFormReturn<ToolFormValues>;
}

export const TagManager = ({ form }: TagManagerProps) => {
  const [tagInput, setTagInput] = useState('');
  const tags = form.watch('tags') || [];

  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    const newTag = tagInput.trim().toLowerCase();
    
    // Verificar se a tag já existe
    if (tags.includes(newTag)) {
      setTagInput('');
      return;
    }
    
    // OTIMIZAÇÃO: Atualização mais direta
    const updatedTags = [...tags, newTag];
    form.setValue('tags', updatedTags, { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true 
    });
    
    setTagInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    // OTIMIZAÇÃO: Atualização mais direta
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', updatedTags, { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Adicionar tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleAddTag} type="button">Adicionar</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {tag}
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
