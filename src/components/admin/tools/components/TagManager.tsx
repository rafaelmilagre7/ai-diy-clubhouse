
import { useState } from 'react';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';

interface TagManagerProps {
  form: UseFormReturn<ToolFormValues>;
}

export const TagManager = ({ form }: TagManagerProps) => {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const normalizedTag = tagInput.trim().toLowerCase();
    if (normalizedTag && !form.getValues('tags').includes(normalizedTag)) {
      form.setValue('tags', [...form.getValues('tags'), normalizedTag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <FormLabel>Tags</FormLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {form.watch('tags').map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Adicione tags..."
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
        />
        <Button type="button" onClick={addTag} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tag
        </Button>
      </div>
    </div>
  );
};
