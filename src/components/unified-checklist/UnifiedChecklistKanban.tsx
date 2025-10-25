import React, { useState, useMemo, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Lightbulb, Sparkles, TrendingUp, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChecklistCardModal } from './ChecklistCardModal';
import { KanbanCard } from './kanban/KanbanCard';
import { KanbanFilters } from './kanban/KanbanFilters';
import { LabelManager, Label } from './kanban/LabelManager';
import { useKeyboardShortcuts } from '@/hooks/kanban/useKeyboardShortcuts';
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

const COLUMNS: { id: ColumnType; title: string; icon: any; gradient: string; glowColor: string }[] = [
  { 
    id: 'todo', 
    title: 'A Fazer', 
    icon: Clock,
    gradient: 'bg-gradient-muted',
    glowColor: 'status-neutral'
  },
  { 
    id: 'in_progress', 
    title: 'Em Progresso', 
    icon: TrendingUp,
    gradient: 'bg-gradient-warning-subtle',
    glowColor: 'status-warning'
  },
  { 
    id: 'done', 
    title: 'Concluído', 
    icon: Sparkles,
    gradient: 'bg-gradient-success-subtle',
    glowColor: 'status-success'
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
  const [selectedLabelItem, setSelectedLabelItem] = useState<UnifiedChecklistItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragInProgressRef = useRef(false);
  const updateMutation = useUpdateUnifiedChecklist();
  const queryClient = useQueryClient();

  // Normalizar itens (adicionar coluna se não existir)
  const normalizedItems = useMemo(() => {
    return checklistItems.map((item, index) => {
      const validColumns: ColumnType[] = ['todo', 'in_progress', 'done'];
      let itemColumn = item.column as ColumnType;
      
      // Preservar in_progress quando válido
      if (!itemColumn || !validColumns.includes(itemColumn)) {
        itemColumn = item.completed ? 'done' : 'todo';
      }
      
      return {
        ...item,
        column: itemColumn,
        order: item.order !== undefined ? item.order : index
      };
    });
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

  const handleDragStart = () => {
    if (dragInProgressRef.current) return;
    dragInProgressRef.current = true;
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    dragInProgressRef.current = false;
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceCol = source.droppableId as ColumnType;
    const destCol = destination.droppableId as ColumnType;

    // 1. Criar nova estrutura de colunas
    const newColumns = {
      todo: [...itemsByColumn.todo],
      in_progress: [...itemsByColumn.in_progress],
      done: [...itemsByColumn.done]
    };

    // 2. Mover item
    const [movedItem] = newColumns[sourceCol].splice(source.index, 1);
    movedItem.column = destCol;
    movedItem.completed = destCol === 'done';
    if (destCol === 'done') {
      movedItem.completedAt = new Date().toISOString();
    }
    newColumns[destCol].splice(destination.index, 0, movedItem);

    // 3. Recalcular orders
    const allItems: UnifiedChecklistItem[] = [];
    (['todo', 'in_progress', 'done'] as ColumnType[]).forEach(col => {
      newColumns[col].forEach((item, idx) => {
        allItems.push({
          ...item,
          order: idx,
          column: col
        });
      });
    });

    // 4. ATUALIZAÇÃO OTIMISTA NO CACHE
    const queryKey = ['unified-checklist', solutionId, checklistData.user_id, checklistType];
    
    queryClient.setQueryData(queryKey, (oldData: UnifiedChecklistData | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        checklist_data: {
          items: allItems,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };
    });

    // 5. Salvar no banco SEM invalidar queries
    updateMutation.mutate(
      {
        checklistData: {
          ...checklistData,
          checklist_data: {
            items: allItems,
            lastUpdated: new Date().toISOString()
          }
        },
        solutionId,
        checklistType,
        templateId,
        silent: true
      },
      {
        onError: (error) => {
          console.error('Erro ao salvar drag:', error);
          // Rollback: invalidar cache para buscar do banco novamente
          queryClient.invalidateQueries({ queryKey });
          toast.error('Erro ao mover card. Recarregando...');
        }
      }
    );

    // 6. Toast de confirmação
    const columnNames = {
      'done': 'Concluído',
      'in_progress': 'Em Progresso',
      'todo': 'A Fazer'
    };
    toast.success(`"${movedItem.title}" movido para ${columnNames[destCol]}!`);
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

  // Handler para atualizar título do card
  const handleTitleUpdate = async (itemId: string, newTitle: string) => {
    const updatedItems = normalizedItems.map(item =>
      item.id === itemId ? { ...item, title: newTitle } : item
    );

    const updatedChecklistData: UnifiedChecklistData = {
      ...checklistData,
      checklist_data: {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    };

    await updateMutation.mutateAsync({
      checklistData: updatedChecklistData,
      solutionId,
      checklistType,
      templateId
    });
  };

  // Handler para duplicar card
  const handleDuplicateCard = (item: UnifiedChecklistItem) => {
    const newItem: UnifiedChecklistItem = {
      ...item,
      id: `item-${Date.now()}`,
      title: `${item.title} (cópia)`,
      completed: false,
      completedAt: undefined,
      column: 'todo',
      order: normalizedItems.length
    };

    const updatedItems = [...normalizedItems, newItem];
    
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

    toast.success('Card duplicado! 📋');
  };

  // Handler para deletar card
  const handleDeleteCard = (itemId: string) => {
    const item = normalizedItems.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Tem certeza que deseja deletar "${item.title}"?`)) return;

    const updatedItems = normalizedItems.filter(i => i.id !== itemId);
    
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

    toast.success('Card deletado! 🗑️');
  };

  // Handler para atualizar labels
  const handleLabelsUpdate = async (itemId: string, labels: Label[]) => {
    const updatedItems = normalizedItems.map(item =>
      item.id === itemId 
        ? { ...item, metadata: { ...item.metadata, labels } } 
        : item
    );

    const updatedChecklistData: UnifiedChecklistData = {
      ...checklistData,
      checklist_data: {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    };

    await updateMutation.mutateAsync({
      checklistData: updatedChecklistData,
      solutionId,
      checklistType,
      templateId
    });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onCloseModal: () => {
      if (isModalOpen) {
        setIsModalOpen(false);
      }
    }
  }, true);

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
      {/* Filtros de Busca */}
      <KanbanFilters 
        items={normalizedItems} 
        onFilterChange={() => {}}
      />

      {/* Tooltip Educativo - Design System Completo */}
      {showKanbanTip && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-scale-in"
        >
          <Card className="glass-card-hover p-6 border-2 border-primary/20 shadow-aurora">
            <div className="flex items-start gap-4">
              <motion.div 
                className="p-3 rounded-xl bg-gradient-aurora shadow-glow-sm"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Lightbulb className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div className="flex-1">
                <h4 className="font-bold text-xl mb-3 aurora-gradient-text flex items-center gap-2">
                  Como usar o Kanban
                  <Badge variant="secondary" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">
                    Dica
                  </Badge>
                </h4>
                <ul className="space-y-3 text-sm mb-4">
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      <strong>Arraste os cards</strong> entre as colunas para organizar suas tarefas
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-status-success/10 group-hover:bg-status-success/20 transition-colors">
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      Ao mover para "Concluído", o item será automaticamente marcado como completo
                    </span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      Clique em um card para ver todos os detalhes e adicionar notas
                    </span>
                  </li>
                </ul>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowKanbanTip(false);
                    localStorage.setItem(`kanban-tip-seen-${solutionId}`, 'true');
                  }}
                  className="w-full sm:w-auto aurora-button"
                >
                  Entendi, vamos lá! 🚀
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Header com Estatísticas - Design System Completo */}
      <Card className="aurora-card p-8 shadow-aurora">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <span className="aurora-gradient-text">Seu Progresso</span>
              {stats.percentage === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="h-6 w-6 text-status-success animate-pulse" />
                </motion.div>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe sua jornada de implementação
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-lg px-5 py-2.5 font-bold shadow-md transition-all",
              stats.percentage === 100 && "bg-gradient-success text-white shadow-glow-sm"
            )}
          >
            {stats.done}/{stats.total}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-muted-foreground">Conclusão</span>
            <span className="font-bold text-lg aurora-gradient-text">{stats.percentage}%</span>
          </div>
          <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 aurora-progress rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div 
            className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-status-neutral" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">A Fazer</span>
            </div>
            <p className="text-3xl font-bold">{stats.todo}</p>
          </div>
          
          <div 
            className="glass-card p-4 rounded-xl border-2 border-status-warning/20 hover:shadow-glow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-status-warning" />
              <span className="text-xs font-semibold text-status-warning uppercase tracking-wide">Em Progresso</span>
            </div>
            <p className="text-3xl font-bold text-status-warning">{stats.in_progress}</p>
          </div>
          
          <div 
            className="glass-card p-4 rounded-xl border-2 border-status-success/20 hover:shadow-glow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-status-success" />
              <span className="text-xs font-semibold text-status-success uppercase tracking-wide">Concluídos</span>
            </div>
            <p className="text-3xl font-bold text-status-success">{stats.done}</p>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="dnd-safe-zone grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => {
            const Icon = column.icon;
            const items = itemsByColumn[column.id];

            return (
              <div key={column.id} className="space-y-3">
                {/* Column Header - Design System */}
                <div className={cn(
                  "glass-card-hover p-5 rounded-2xl border-2 shadow-md transition-all duration-300",
                  column.gradient,
                  column.id === 'done' && "border-status-success/30",
                  column.id === 'in_progress' && "border-status-warning/30",
                  column.id === 'todo' && "border-border"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={cn(
                          "p-2.5 rounded-xl shadow-sm transition-shadow hover:shadow-md",
                          column.id === 'done' && "bg-gradient-success",
                          column.id === 'in_progress' && "bg-gradient-warning",
                          column.id === 'todo' && "bg-muted"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          column.id === 'done' && "text-white",
                          column.id === 'in_progress' && "text-white",
                          column.id === 'todo' && "text-muted-foreground"
                        )} />
                      </div>
                      <h3 className="font-bold text-base">{column.title}</h3>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "font-bold px-4 py-1.5 text-sm shadow-sm",
                        column.id === 'done' && "bg-status-success/10 text-status-success border-status-success/20",
                        column.id === 'in_progress' && "bg-status-warning/10 text-status-warning border-status-warning/20"
                      )}
                    >
                      {items.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Area - Design System */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => {
                    // Log para debug de drag over
                    if (snapshot.isDraggingOver) {
                      console.log(`🎯 Dragging over: ${column.id}`, {
                        draggingOverWith: snapshot.draggingOverWith,
                        draggingFromThisWith: snapshot.draggingFromThisWith
                      });
                    }
                    
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ 
                          minHeight: '600px',
                          backgroundColor: snapshot.isDraggingOver 
                            ? 'hsl(var(--primary) / 0.05)' 
                            : 'transparent',
                          willChange: 'background-color'
                        }}
                        className={cn(
                          "rounded-2xl border-2 p-6",
                          snapshot.isDraggingOver 
                            ? "border-primary ring-4 ring-primary/20" 
                            : cn(
                                "border-dashed",
                                column.id === 'done' && "border-status-success/30",
                                column.id === 'in_progress' && "border-status-warning/30",
                                column.id === 'todo' && "border-border"
                              )
                        )}
                      >
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                          <div className="p-4 rounded-full bg-muted/50 mb-3">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Nenhum item aqui
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Arraste cards para esta coluna
                          </p>
                        </div>
                      )}

                      {/* Placeholder de drop */}
                      {items.length === 0 && snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary rounded-xl bg-primary/5">
                          <div className="text-primary font-semibold">Solte aqui</div>
                          <div className="text-xs text-muted-foreground">O card será movido para esta coluna</div>
                        </div>
                      )}

                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => {
                            return (
                              <KanbanCard
                                item={item}
                                provided={provided}
                                snapshot={snapshot}
                                onTitleUpdate={handleTitleUpdate}
                                onEdit={() => handleCardClick(item)}
                                onDuplicate={() => handleDuplicateCard(item)}
                                onDelete={() => handleDeleteCard(item.id)}
                                onAddLabel={() => setSelectedLabelItem(item)}
                              />
                            );
                          }}
                        </Draggable>
                      ))}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Completion Message - Design System Completo */}
      {stats.percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-success-subtle border-2 border-status-success/40 p-10 text-center shadow-aurora"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="inline-block mb-6"
            >
              <div className="p-6 rounded-full bg-gradient-success shadow-glow">
                <Sparkles className="h-16 w-16 text-white animate-pulse" />
              </div>
            </motion.div>
            <motion.h3 
              className="text-3xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="aurora-gradient-text">Parabéns! Missão Cumprida!</span> 🎉
            </motion.h3>
            <motion.p 
              className="text-muted-foreground mb-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Você completou todos os itens do plano de ação. Continue assim!
            </motion.p>
            <motion.div 
              className="flex items-center justify-center gap-2 text-status-success font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CheckCircle className="h-5 w-5" />
              <span>{stats.total} de {stats.total} tarefas concluídas</span>
            </motion.div>
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

      {/* Label Manager Modal */}
      {selectedLabelItem && (
        <LabelManager
          item={selectedLabelItem}
          onLabelsUpdate={handleLabelsUpdate}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </div>
  );
};

export default UnifiedChecklistKanban;
