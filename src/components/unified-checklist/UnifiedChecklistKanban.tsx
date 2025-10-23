import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Loader, Lightbulb, Sparkles, TrendingUp, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChecklistCardModal } from './ChecklistCardModal';
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

const COLUMNS: { id: ColumnType; title: string; icon: any; bgGradient: string; borderColor: string; headerBg: string }[] = [
  { 
    id: 'todo', 
    title: 'A Fazer', 
    icon: Clock,
    bgGradient: 'from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    headerBg: 'bg-slate-100 dark:bg-slate-800'
  },
  { 
    id: 'in_progress', 
    title: 'Em Progresso', 
    icon: TrendingUp,
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    headerBg: 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50'
  },
  { 
    id: 'done', 
    title: 'Concluído', 
    icon: Sparkles,
    bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    headerBg: 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50'
  },
];

const UnifiedChecklistKanban: React.FC<UnifiedChecklistKanbanProps> = ({
  checklistItems,
  checklistData,
  solutionId,
  checklistType,
  templateId
}) => {
  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCardClick = (item: UnifiedChecklistItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleNotesChange = (itemId: string, notes: string) => {
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
      {/* Tooltip Educativo com Design Rico */}
      {showKanbanTip && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  Como usar o Kanban
                  <Badge variant="secondary" className="text-xs">Dica</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Arraste os cards entre as colunas para organizar suas tarefas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-success" />
                    <span>Ao mover para "Concluído", o item será automaticamente marcado como completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Clique em um card para ver todos os detalhes e adicionar notas</span>
                  </li>
                </ul>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowKanbanTip(false);
                    localStorage.setItem(`kanban-tip-seen-${solutionId}`, 'true');
                  }}
                  className="w-full sm:w-auto"
                >
                  Entendi, vamos lá! 🚀
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Header com Estatísticas Ricas */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Seu Progresso
              {stats.percentage === 100 && <Sparkles className="h-5 w-5 text-success animate-pulse" />}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe sua jornada de implementação
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-2 font-bold">
            {stats.done}/{stats.total}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Conclusão</span>
            <span className="font-bold text-primary">{stats.percentage}%</span>
          </div>
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-glow to-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">A Fazer</span>
            </div>
            <p className="text-2xl font-bold">{stats.todo}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Em Progresso</span>
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.in_progress}</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Concluídos</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.done}</p>
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
                {/* Column Header - Design Rico */}
                <div className={cn(
                  "p-4 rounded-xl border-2 shadow-sm",
                  column.headerBg,
                  column.borderColor
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold">{column.title}</h3>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="font-bold px-3 py-1 text-sm"
                    >
                      {items.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[300px] rounded-xl border-2 p-4 transition-all duration-300",
                        "bg-gradient-to-br",
                        column.bgGradient,
                        snapshot.isDraggingOver 
                          ? "border-primary shadow-lg ring-4 ring-primary/20 scale-[1.02]" 
                          : cn("border-dashed", column.borderColor)
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center h-48 text-center p-6"
                          >
                            <div className="p-4 rounded-full bg-muted/50 mb-3">
                              <Icon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Nenhum item aqui
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Arraste cards para esta coluna
                            </p>
                          </motion.div>
                        )}

                        {items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "mb-3 last:mb-0",
                                  snapshot.isDragging && "z-50"
                                )}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card 
                                  className={cn(
                                    "group relative cursor-pointer transition-all duration-200",
                                    "hover:shadow-lg hover:border-primary/50",
                                    snapshot.isDragging && "rotate-2 shadow-2xl scale-105 ring-4 ring-primary/30 border-primary"
                                  )}
                                  onClick={() => handleCardClick(item)}
                                >
                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-muted"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  <div className="p-4 space-y-3">
                                    <div className="pr-8">
                                      <h4 className="font-semibold leading-tight mb-2">
                                        {item.title}
                                      </h4>
                                      
                                      {item.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                      {item.metadata?.estimated_time && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                          <Clock className="h-3 w-3" />
                                          {item.metadata.estimated_time}
                                        </Badge>
                                      )}
                                      
                                      {item.metadata?.difficulty && (
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-xs",
                                            item.metadata.difficulty === 'easy' && "border-green-500/30 text-green-600",
                                            item.metadata.difficulty === 'medium' && "border-yellow-500/30 text-yellow-600",
                                            item.metadata.difficulty === 'hard' && "border-red-500/30 text-red-600"
                                          )}
                                        >
                                          {item.metadata.difficulty === 'easy' && '⚡ Fácil'}
                                          {item.metadata.difficulty === 'medium' && '⚠️ Médio'}
                                          {item.metadata.difficulty === 'hard' && '🔥 Difícil'}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Footer com indicador de notas */}
                                    {item.notes && (
                                      <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                          <span>✏️</span>
                                          Tem notas pessoais
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              </motion.div>
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

      {/* Completion Message - Design Rico */}
      {stats.percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/20 via-success/10 to-transparent border-2 border-success/30 p-8 text-center shadow-lg"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Sparkles className="h-16 w-16 text-success mx-auto mb-4 animate-pulse" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent">
            Parabéns! Missão Cumprida! 🎉
          </h3>
          <p className="text-muted-foreground mb-4">
            Você completou todos os itens do plano de ação. Continue assim!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="font-semibold">{stats.total} de {stats.total} tarefas concluídas</span>
          </div>
        </motion.div>
      )}

      {/* Modal de Detalhes */}
      <ChecklistCardModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNotesChange={handleNotesChange}
        isUpdating={updateMutation.isPending}
      />
    </div>
  );
};

export default UnifiedChecklistKanban;
