import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  FileText,
  Link as LinkIcon,
  Zap
} from 'lucide-react';
import { UnifiedChecklistItem } from '@/hooks/useUnifiedChecklists';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChecklistCardModalProps {
  item: UnifiedChecklistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNotesChange: (itemId: string, notes: string) => void;
  isUpdating?: boolean;
}

export const ChecklistCardModal: React.FC<ChecklistCardModalProps> = ({
  item,
  isOpen,
  onClose,
  onNotesChange,
  isUpdating = false
}) => {
  const [localNotes, setLocalNotes] = useState(item?.notes || '');

  React.useEffect(() => {
    if (item) {
      setLocalNotes(item.notes || '');
    }
  }, [item]);

  if (!item) return null;

  const difficultyConfig: Record<string, { label: string; color: string; icon: any }> = {
    easy: { label: 'Fácil', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
    medium: { label: 'Médio', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertCircle },
    hard: { label: 'Difícil', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: Zap }
  };

  const difficulty = item.metadata?.difficulty || 'medium';
  const difficultyInfo = difficultyConfig[difficulty] || difficultyConfig.medium;
  const DifficultyIcon = difficultyInfo.icon;

  const hasChanges = localNotes !== item.notes;

  const handleSave = () => {
    onNotesChange(item.id, localNotes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8 leading-tight">
            {item.title}
          </DialogTitle>
          {item.completed && item.completedAt && (
            <DialogDescription className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              Concluído em {new Date(item.completedAt).toLocaleDateString('pt-BR')}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {item.metadata?.estimated_time && (
              <Badge variant="outline" className="gap-1.5">
                <Clock className="h-3 w-3" />
                {item.metadata.estimated_time}
              </Badge>
            )}
            
            {difficulty && (
              <Badge variant="outline" className={cn("gap-1.5", difficultyInfo.color)}>
                <DifficultyIcon className="h-3 w-3" />
                {difficultyInfo.label}
              </Badge>
            )}

            {item.column && (
              <Badge 
                variant="secondary" 
                className={cn(
                  item.column === 'done' && "bg-success/10 text-success border-success/20",
                  item.column === 'in_progress' && "bg-status-warning/10 text-status-warning border-status-warning/20"
                )}
              >
                {item.column === 'todo' && 'A Fazer'}
                {item.column === 'in_progress' && 'Em Progresso'}
                {item.column === 'done' && 'Concluído'}
              </Badge>
            )}
          </div>

          {/* Descrição */}
          {item.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Descrição
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          )}

          {/* Critérios de Validação */}
          {item.metadata?.validation_criteria && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Critérios de Validação
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.metadata.validation_criteria}
                </p>
              </div>
            </div>
          )}

          {/* Armadilhas Comuns */}
          {item.metadata?.common_pitfalls && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Armadilhas Comuns
              </div>
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.metadata.common_pitfalls}
                </p>
              </div>
            </div>
          )}

          {/* Recursos */}
          {item.metadata?.resources && Array.isArray(item.metadata.resources) && item.metadata.resources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LinkIcon className="h-4 w-4 text-primary" />
                Recursos Úteis
              </div>
              <div className="space-y-2">
                {item.metadata.resources.map((resource: string, index: number) => (
                  <motion.a
                    key={index}
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors text-sm text-primary hover:underline"
                    whileHover={{ x: 4 }}
                  >
                    <LinkIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{resource}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Notas Pessoais */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Suas Notas
              </div>
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Não salvo
                </Badge>
              )}
            </div>
            <Textarea
              placeholder="Adicione suas observações, insights ou progresso..."
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="min-h-32 resize-none"
            />
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? 'Salvando...' : 'Salvar Notas'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
