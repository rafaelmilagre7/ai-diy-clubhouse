import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useCreateOpportunity } from '@/hooks/networking/useOpportunities';

interface PostOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostOpportunityModal = ({ open, onOpenChange }: PostOpportunityModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityType, setOpportunityType] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [contactPreference, setContactPreference] = useState('platform');

  const createMutation = useCreateOpportunity();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !opportunityType) {
      return;
    }

    await createMutation.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      opportunity_type: opportunityType,
      tags,
      contact_preference: contactPreference,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setOpportunityType('');
    setTags([]);
    setTagInput('');
    setContactPreference('platform');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Postar Nova Oportunidade</DialogTitle>
          <DialogDescription>
            Compartilhe uma oportunidade de negócio com a comunidade
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Procuro parceiro para expansão nacional"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva a oportunidade em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 caracteres</p>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Oportunidade *</Label>
            <Select value={opportunityType} onValueChange={setOpportunityType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parceria">🤝 Parceria</SelectItem>
                <SelectItem value="fornecedor">📦 Fornecedor</SelectItem>
                <SelectItem value="cliente">💼 Cliente</SelectItem>
                <SelectItem value="investimento">💰 Investimento</SelectItem>
                <SelectItem value="outro">🎯 Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (máximo 5)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Ex: tecnologia, saúde, B2B"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
              >
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preferência de Contato */}
          <div className="space-y-3">
            <Label>Como deseja ser contatado?</Label>
            <RadioGroup value={contactPreference} onValueChange={setContactPreference}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="platform" id="platform" />
                <Label htmlFor="platform" className="font-normal cursor-pointer">
                  Chat da plataforma
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linkedin" id="linkedin" />
                <Label htmlFor="linkedin" className="font-normal cursor-pointer">
                  LinkedIn
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="font-normal cursor-pointer">
                  WhatsApp
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="font-normal cursor-pointer">
                  Email
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publicando...' : 'Publicar Oportunidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
