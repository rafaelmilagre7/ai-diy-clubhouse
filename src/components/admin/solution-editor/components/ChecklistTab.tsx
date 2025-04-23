
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Plus, Trash, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ChecklistItem {
  id: string;
  text: string;
}

interface ChecklistTabProps {
  solution: any;
  onUpdate: (checklist: ChecklistItem[]) => void;
  existingChecklist: ChecklistItem[];
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ 
  solution, 
  onUpdate, 
  existingChecklist = [] 
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existingChecklist || []);
  const [newItemText, setNewItemText] = useState('');
  const { toast } = useToast();

  // Efeito para inicializar o checklist quando vierem dados externos
  useEffect(() => {
    if (existingChecklist && existingChecklist.length > 0) {
      setChecklist(existingChecklist);
    }
  }, [existingChecklist]);

  // Adicionar novo item ao checklist
  const addChecklistItem = () => {
    if (!newItemText.trim()) {
      toast({
        title: "Texto obrigatório",
        description: "Digite o texto para o item do checklist",
        variant: "destructive"
      });
      return;
    }

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText
    };

    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewItemText('');
    onUpdate(updatedChecklist);
  };

  // Remover item do checklist
  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);
    onUpdate(updatedChecklist);
  };

  // Atualizar texto de um item
  const updateItemText = (id: string, text: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, text } : item
    );
    setChecklist(updatedChecklist);
    onUpdate(updatedChecklist);
  };

  // Reordenar itens após arrastar e soltar
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(checklist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setChecklist(items);
    onUpdate(items);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Checklist de Implementação</CardTitle>
          <p className="text-sm text-muted-foreground">
            Crie um checklist para guiar os membros durante a implementação
          </p>
        </CardHeader>
        <CardContent>
          {checklist.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <CheckSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Nenhum item no checklist
              </p>
              <p className="text-sm text-muted-foreground/75">
                Adicione itens para ajudar na implementação
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checklist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {checklist.map((item, index) => (
                        <Draggable 
                          key={item.id} 
                          draggableId={item.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center space-x-2 border p-3 rounded-md bg-card"
                            >
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input 
                                value={item.text}
                                onChange={(e) => updateItemText(item.id, e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChecklistItem(item.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Input 
              placeholder="Novo item do checklist..." 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addChecklistItem();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addChecklistItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas para um bom checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Use verbos de ação no início de cada item (Configurar, Instalar, Ativar)</p>
          <p>• Mantenha os itens concisos e objetivos</p>
          <p>• Organize em ordem lógica de implementação</p>
          <p>• Inclua de 5 a 10 itens para uma experiência ideal</p>
          <p>• Evite itens vagos ou ambíguos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistTab;
