import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { Sparkles, MessageSquare, Linkedin, Send, Mail } from 'lucide-react';
import { useCreateOpportunity } from '@/hooks/networking/useOpportunities';
import { TagSelector } from './TagSelector';
import { cn } from '@/lib/utils';

interface PostOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostOpportunityModal = ({ open, onOpenChange }: PostOpportunityModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityType, setOpportunityType] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState('platform');

  const createMutation = useCreateOpportunity();


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
    setContactPreference('platform');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-aurora via-viverblue to-operational">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
              Postar Nova Oportunidade
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Compartilhe uma oportunidade de negócio com a comunidade e amplie sua rede
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
              className="liquid-glass-card border-aurora/20 focus:border-aurora h-12 text-base"
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
              className="liquid-glass-card border-aurora/20 focus:border-aurora resize-none"
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 caracteres</p>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base">Tipo de Oportunidade *</Label>
            <Select value={opportunityType} onValueChange={setOpportunityType} required>
              <SelectTrigger id="type" className="liquid-glass-card border-aurora/20 h-12">
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

          {/* Tags com Seletor */}
          <TagSelector selectedTags={tags} onChange={setTags} />

          {/* Preferência de Contato - Redesenhado */}
          <div className="space-y-3">
            <Label className="text-base">Como deseja ser contatado? *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = contactPreference === option.value;

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setContactPreference(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'relative p-4 rounded-xl border transition-all duration-200 text-left',
                      'hover:shadow-lg hover:shadow-aurora/20',
                      isSelected
                        ? 'border-aurora/40 bg-gradient-to-br from-aurora/10 to-viverblue/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                          isSelected
                            ? 'bg-gradient-to-br from-aurora to-viverblue text-white'
                            : 'bg-white/10 text-muted-foreground'
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
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-aurora to-viverblue flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
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
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="aurora" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publicando...' : 'Publicar Oportunidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
