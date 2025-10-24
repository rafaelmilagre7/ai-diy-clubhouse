import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";

export interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelManagerProps {
  item: UnifiedChecklistItem;
  onLabelsUpdate: (itemId: string, labels: Label[]) => Promise<void>;
  trigger?: React.ReactNode;
}

const LABEL_COLORS = [
  { name: 'Verde', value: 'hsl(142, 71%, 45%)' },
  { name: 'Azul', value: 'hsl(221, 83%, 53%)' },
  { name: 'Amarelo', value: 'hsl(48, 96%, 53%)' },
  { name: 'Vermelho', value: 'hsl(0, 84%, 60%)' },
  { name: 'Roxo', value: 'hsl(271, 91%, 65%)' },
  { name: 'Rosa', value: 'hsl(330, 81%, 60%)' },
  { name: 'Laranja', value: 'hsl(25, 95%, 53%)' },
  { name: 'Cinza', value: 'hsl(215, 14%, 34%)' },
  { name: 'Turquesa', value: 'hsl(173, 80%, 40%)' },
  { name: 'Índigo', value: 'hsl(239, 84%, 67%)' }
];

export const LabelManager: React.FC<LabelManagerProps> = ({ 
  item, 
  onLabelsUpdate,
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>(() => {
    // Carregar labels do localStorage se existirem
    const saved = localStorage.getItem('kanban-available-labels');
    return saved ? JSON.parse(saved) : [];
  });
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLabels = (item.metadata?.labels || []) as Label[];

  const createLabel = () => {
    if (!newLabelName.trim()) {
      toast.error('Digite um nome para o label');
      return;
    }

    const newLabel: Label = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: selectedColor
    };

    const updatedAvailableLabels = [...availableLabels, newLabel];
    setAvailableLabels(updatedAvailableLabels);
    localStorage.setItem('kanban-available-labels', JSON.stringify(updatedAvailableLabels));
    
    setNewLabelName('');
    toast.success('Label criado! 🏷️');
  };

  const toggleLabel = async (label: Label) => {
    const hasLabel = currentLabels.some((l: Label) => l.id === label.id);

    const updatedLabels = hasLabel
      ? currentLabels.filter((l: Label) => l.id !== label.id)
      : [...currentLabels, label];

    setIsUpdating(true);
    try {
      await onLabelsUpdate(item.id, updatedLabels);
      toast.success(hasLabel ? 'Label removido' : 'Label adicionado');
    } catch (error) {
      console.error('Erro ao atualizar labels:', error);
      toast.error('Erro ao atualizar labels');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLabel = (labelId: string) => {
    const updatedAvailableLabels = availableLabels.filter(l => l.id !== labelId);
    setAvailableLabels(updatedAvailableLabels);
    localStorage.setItem('kanban-available-labels', JSON.stringify(updatedAvailableLabels));
    toast.success('Label deletado');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 mr-2" />
            Labels
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Labels disponíveis */}
          {availableLabels.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Labels disponíveis:</p>
              <div className="grid grid-cols-2 gap-2">
                {availableLabels.map(label => {
                  const isApplied = currentLabels.some((l: Label) => l.id === label.id);
                  return (
                    <div key={label.id} className="flex items-center gap-1">
                      <Button
                        variant={isApplied ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleLabel(label)}
                        disabled={isUpdating}
                        style={isApplied ? { 
                          backgroundColor: label.color, 
                          borderColor: label.color,
                          color: 'white'
                        } : {}}
                        className="flex-1 justify-start text-xs"
                      >
                        {isApplied && <Check className="h-3 w-3 mr-1" />}
                        {label.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteLabel(label.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Criar novo label */}
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium">Criar novo label:</p>
            <Input
              placeholder="Nome do label..."
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  createLabel();
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === color.value 
                      ? "ring-2 ring-primary ring-offset-2 scale-110" 
                      : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <Button onClick={createLabel} className="w-full">
              <Tag className="h-4 w-4 mr-2" />
              Criar Label
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
