import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Loader, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  useUpdateUnifiedChecklist,
  type UnifiedChecklistItem,
  type UnifiedChecklistData
} from "@/hooks/useUnifiedChecklists";

interface UnifiedChecklistKanbanProps {
  checklistItems: UnifiedChecklistItem[];
  checklistData: UnifiedChecklistData;
  solutionId: string;
  checklistType: string;
  templateId?: string;
}

type ColumnType = 'todo' | 'in_progress' | 'done';

const COLUMNS: { id: ColumnType; title: string; icon: any; color: string }[] = [
  { 
    id: 'todo', 
    title: 'A Fazer', 
    icon: Clock, 
    color: 'text-muted-foreground border-border bg-muted/20' 
  },
  { 
    id: 'in_progress', 
    title: 'Em Progresso', 
    icon: Loader, 
    color: 'text-status-warning border-status-warning/30 bg-status-warning/10' 
  },
  { 
    id: 'done', 
    title: 'Concluído', 
    icon: CheckCircle, 
    color: 'text-success border-success/30 bg-success/10' 
  },
];

const UnifiedChecklistKanban: React.FC<UnifiedChecklistKanbanProps> = ({
  checklistItems,
  checklistData,
  solutionId,
  checklistType,
  templateId
}) => {
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showKanbanTip, setShowKanbanTip] = useState(() => {
    return !localStorage.getItem(`kanban-tip-seen-${solutionId}`);
  });
  const updateMutation = useUpdateUnifiedChecklist();

  // Normalizar itens (adicionar coluna se não existir)
  const normalizedItems = useMemo(() => {
    return checklistItems.map((item, index) => ({
      ...item,
      column: item.column || (item.completed ? 'done' : 'todo'),
      order: item.order !== undefined ? item.order : index
    }));
  }, [checklistItems]);

  // Agrupar itens por coluna
  const itemsByColumn = useMemo(() => {
    const grouped: Record<ColumnType, UnifiedChecklistItem[]> = {
      todo: [],
      in_progress: [],
      done: []
    };

    normalizedItems.forEach(item => {
      const column = item.column as ColumnType;
      grouped[column].push(item);
    });

    // Ordenar por order dentro de cada coluna
    Object.keys(grouped).forEach(col => {
      grouped[col as ColumnType].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  }, [normalizedItems]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = source.droppableId as ColumnType;
    const destColumn = destination.droppableId as ColumnType;

    // Criar cópia dos itens
    const newItemsByColumn = { ...itemsByColumn };
    const sourceItems = [...newItemsByColumn[sourceColumn]];
    const destItems = sourceColumn === destColumn ? sourceItems : [...newItemsByColumn[destColumn]];

    // Remover do source
    const [movedItem] = sourceItems.splice(source.index, 1);

    // Adicionar ao destination
    destItems.splice(destination.index, 0, {
      ...movedItem,
      column: destColumn,
      completed: destColumn === 'done'
    });

    // Atualizar orders
    const updatedItems = normalizedItems.map(item => {
      if (item.id === movedItem.id) {
        return {
          ...item,
          column: destColumn,
          completed: destColumn === 'done',
          order: destination.index,
          completedAt: destColumn === 'done' ? new Date().toISOString() : undefined
        };
      }

      // Reordenar itens da coluna de origem
      if (item.column === sourceColumn) {
        const newIndex = sourceItems.findIndex(i => i.id === item.id);
        return { ...item, order: newIndex >= 0 ? newIndex : item.order };
      }

      // Reordenar itens da coluna de destino
      if (item.column === destColumn) {
        const newIndex = destItems.findIndex(i => i.id === item.id);
        return { ...item, order: newIndex >= 0 ? newIndex : item.order };
      }

      return item;
    });

    // Salvar no banco
    const updatedChecklistData: UnifiedChecklistData = {
      ...checklistData,
      checklist_data: {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    };

    updateMutation.mutate({
      checklistData: updatedChecklistData,
      solutionId,
      checklistType,
      templateId
    });
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const saveNotes = (itemId: string, notes: string) => {
    const updatedItems = normalizedItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );

    const updatedChecklistData: UnifiedChecklistData = {
      ...checklistData,
      checklist_data: {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    };

    updateMutation.mutate({
      checklistData: updatedChecklistData,
      solutionId,
      checklistType,
      templateId
    });
  };

  // Calcular estatísticas
  const stats = {
    todo: itemsByColumn.todo.length,
    in_progress: itemsByColumn.in_progress.length,
    done: itemsByColumn.done.length,
    total: normalizedItems.length,
    percentage: normalizedItems.length > 0 
      ? Math.round((itemsByColumn.done.length / normalizedItems.length) * 100) 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Tooltip Educativo */}
      {showKanbanTip && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Dica: Como usar o Kanban</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Arraste os cards entre as colunas para organizar suas tarefas. 
                Ao mover para "Concluído", o item será automaticamente marcado como completo.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowKanbanTip(false);
                  localStorage.setItem(`kanban-tip-seen-${solutionId}`, 'true');
                }}
              >
                Entendi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header com Estatísticas */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Progresso Kanban</h3>
          <Badge variant="outline">
            {stats.done}/{stats.total} concluídos
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-muted-foreground">{stats.todo} A Fazer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <span className="text-muted-foreground">{stats.in_progress} Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">{stats.done} Concluídos</span>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => {
            const Icon = column.icon;
            const items = itemsByColumn[column.id];

            return (
              <div key={column.id} className="space-y-3">
                {/* Column Header */}
                <Card className={cn("p-3 border-2", column.color)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                </Card>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[200px] rounded-lg border-2 border-dashed p-3 transition-colors",
                        snapshot.isDraggingOver 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-muted/20"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-32 text-sm text-muted-foreground"
                          >
                            Arraste itens para cá
                          </motion.div>
                        )}

                        {items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "mb-3 last:mb-0 transition-transform",
                                  snapshot.isDragging && "rotate-3 shadow-2xl scale-105"
                                )}
                              >
                                <Card 
                                  className={cn(
                                    "p-3 cursor-grab active:cursor-grabbing transition-all",
                                    snapshot.isDragging && "ring-2 ring-primary"
                                  )}
                                >
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm leading-tight">
                                      {item.title}
                                    </h4>
                                    
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}

                                    {expandedItems.has(item.id) && (
                                      <div className="space-y-2 pt-2 border-t">
                                        <Textarea
                                          placeholder="Suas notas..."
                                          value={itemNotes[item.id] || item.notes || ''}
                                          onChange={(e) => setItemNotes(prev => ({ 
                                            ...prev, 
                                            [item.id]: e.target.value 
                                          }))}
                                          className="min-h-16 text-xs"
                                        />
                                        {(itemNotes[item.id] !== undefined && itemNotes[item.id] !== item.notes) && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => saveNotes(item.id, itemNotes[item.id])}
                                            disabled={updateMutation.isPending}
                                            className="text-xs h-7"
                                          >
                                            Salvar notas
                                          </Button>
                                        )}
                                      </div>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleExpanded(item.id)}
                                      className="w-full text-xs h-6"
                                    >
                                      {expandedItems.has(item.id) ? 'Ocultar' : 'Ver mais'}
                                    </Button>
                                  </div>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Completion Message */}
      {stats.percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-success/10 border border-success/30 text-center"
        >
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-semibold text-success">
            Parabéns! Todos os itens foram concluídos! 🎉
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UnifiedChecklistKanban;
