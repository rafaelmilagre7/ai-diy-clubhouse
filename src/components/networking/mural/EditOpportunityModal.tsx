import { useState, useEffect } from 'react';
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
import { MessageSquare, Linkedin, Send, Mail } from 'lucide-react';
import { useUpdateOpportunity, Opportunity } from '@/hooks/networking/useOpportunities';
import { TagSelector } from './TagSelector';
import { cn } from '@/lib/utils';

interface EditOpportunityModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditOpportunityModal = ({ opportunity, open, onOpenChange }: EditOpportunityModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityType, setOpportunityType] = useState<'parceria' | 'fornecedor' | 'cliente' | 'investimento' | 'outro' | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState<'platform' | 'linkedin' | 'whatsapp' | 'email'>('platform');

  const updateMutation = useUpdateOpportunity();

  // Preencher campos quando oportunidade é carregada
  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title);
      setDescription(opportunity.description);
      setOpportunityType(opportunity.opportunity_type);
      setTags(opportunity.tags || []);
      setContactPreference(opportunity.contact_preference);
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opportunity || !title.trim() || !description.trim() || !opportunityType) {
      return;
    }

    await updateMutation.mutateAsync({
      id: opportunity.id,
      updates: {
        title: title.trim(),
        description: description.trim(),
        opportunity_type: opportunityType,
        tags,
        contact_preference: contactPreference,
      },
    });

    onOpenChange(false);
  };

  const contactOptions = [
    {
      value: 'platform',
      label: 'Chat da Plataforma',
      icon: MessageSquare,
      description: 'Receba mensagens direto na plataforma',
    },
    {
      value: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      description: 'Conecte-se pelo LinkedIn',
    },
    {
      value: 'whatsapp',
      label: 'WhatsApp',
      icon: Send,
      description: 'Contato direto via WhatsApp',
    },
    {
      value: 'email',
      label: 'Email',
      icon: Mail,
      description: 'Prefiro contato por email',
    },
  ];

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Editar Oportunidade
          </DialogTitle>
          <DialogDescription className="text-base">
            Atualize as informações da sua oportunidade
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Procuro parceiro para expansão nacional"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              className="h-11 text-base"
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva a oportunidade em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 caracteres</p>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base">Tipo de Oportunidade *</Label>
            <Select 
              value={opportunityType} 
              onValueChange={(value) => setOpportunityType(value as typeof opportunityType)} 
              required
            >
              <SelectTrigger id="type" className="h-11">
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
          <TagSelector selectedTags={tags} onChange={setTags} />

          {/* Preferência de Contato */}
          <div className="space-y-3">
            <Label className="text-base">Como deseja ser contatado? *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = contactPreference === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setContactPreference(option.value as typeof contactPreference)}
                    className={cn(
                      'relative p-4 rounded-xl border transition-all duration-200 text-left',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="aurora" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
