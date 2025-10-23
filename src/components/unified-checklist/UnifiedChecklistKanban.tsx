import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Lightbulb, Sparkles, TrendingUp, Info } from "lucide-react";
import { motion } from "framer-motion";
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
    console.log('🎯 handleDragEnd iniciado:', result);
    
    const { source, destination } = result;

    // Validações básicas
    if (!destination) {
      console.log('❌ Sem destination, abortando');
      return;
    }
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('❌ Mesma posição, abortando');
      return;
    }

    const sourceColumn = source.droppableId as ColumnType;
    const destColumn = destination.droppableId as ColumnType;
    
    console.log('📍 Movendo de', sourceColumn, 'índice', source.index, 'para', destColumn, 'índice', destination.index);

    // Criar cópia completa de todos os itens
    const allItems = [...normalizedItems];
    
    // Encontrar o item sendo movido
    const movedItem = allItems.find(item => 
      item.column === sourceColumn && 
      itemsByColumn[sourceColumn].findIndex(i => i.id === item.id) === source.index
    );
    
    if (!movedItem) {
      console.log('❌ Item não encontrado');
      return;
    }
    
    console.log('📦 Item sendo movido:', movedItem.title);

    // Atualizar todos os itens
    const updatedItems = allItems.map(item => {
      // O item que está sendo movido
      if (item.id === movedItem.id) {
        console.log('✏️ Atualizando item movido para coluna:', destColumn);
        return {
          ...item,
          column: destColumn,
          completed: destColumn === 'done',
          order: destination.index,
          completedAt: destColumn === 'done' ? new Date().toISOString() : item.completedAt
        };
      }
      
      // Itens que permaneceram na coluna de origem (ajustar order)
      if (item.column === sourceColumn && sourceColumn !== destColumn) {
        const currentIndex = itemsByColumn[sourceColumn].findIndex(i => i.id === item.id);
        if (currentIndex > source.index) {
          return { ...item, order: currentIndex - 1 };
        }
      }
      
      // Itens na coluna de destino (ajustar order)
      if (item.column === destColumn && item.id !== movedItem.id) {
        const currentIndex = itemsByColumn[destColumn].findIndex(i => i.id === item.id);
        if (currentIndex >= destination.index) {
          return { ...item, order: currentIndex + 1 };
        }
      }
      
      return item;
    });

    console.log('💾 Salvando items atualizados:', updatedItems);

    // Salvar no banco de dados
    updateMutation.mutate({
      checklistData: {
        ...checklistData,
        checklist_data: {
          items: updatedItems,
          lastUpdated: new Date().toISOString()
        }
      },
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
            <motion.div 
              className="absolute inset-y-0 left-0 aurora-progress rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <motion.div 
            className="glass-card p-4 rounded-xl hover:shadow-md transition-all"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-status-neutral" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">A Fazer</span>
            </div>
            <p className="text-3xl font-bold">{stats.todo}</p>
          </motion.div>
          
          <motion.div 
            className="glass-card p-4 rounded-xl border-2 border-status-warning/20 hover:shadow-glow-sm transition-all"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-status-warning" />
              <span className="text-xs font-semibold text-status-warning uppercase tracking-wide">Em Progresso</span>
            </div>
            <p className="text-3xl font-bold text-status-warning">{stats.in_progress}</p>
          </motion.div>
          
          <motion.div 
            className="glass-card p-4 rounded-xl border-2 border-status-success/20 hover:shadow-glow-sm transition-all"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-status-success" />
              <span className="text-xs font-semibold text-status-success uppercase tracking-wide">Concluídos</span>
            </div>
            <p className="text-3xl font-bold text-status-success">{stats.done}</p>
          </motion.div>
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
                      <motion.div 
                        className={cn(
                          "p-2.5 rounded-xl shadow-sm",
                          column.id === 'done' && "bg-gradient-success",
                          column.id === 'in_progress' && "bg-gradient-warning",
                          column.id === 'todo' && "bg-muted"
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          column.id === 'done' && "text-white",
                          column.id === 'in_progress' && "text-white",
                          column.id === 'todo' && "text-muted-foreground"
                        )} />
                      </motion.div>
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
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[400px] rounded-2xl border-2 p-5 transition-all duration-300 backdrop-blur-sm",
                        column.gradient,
                        snapshot.isDraggingOver 
                          ? "border-primary shadow-aurora ring-4 ring-primary/20 scale-[1.01]" 
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

                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4 last:mb-0"
                                style={provided.draggableProps.style}
                              >
                                <Card 
                                  className={cn(
                                    "group relative select-none p-5 transition-shadow",
                                    snapshot.isDragging ? "shadow-lg ring-2 ring-primary cursor-grabbing" : "cursor-grab hover:shadow-md"
                                  )}
                                >
                                  {/* Botão Info para abrir modal */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleCardClick(item);
                                    }}
                                    className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 z-10"
                                    title="Ver detalhes"
                                  >
                                    <Info className="h-4 w-4 text-primary" />
                                  </button>

                                  <div className="space-y-4">
                                    <div className="pr-10">
                                      <h4 className="font-semibold text-base leading-tight mb-2">
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
                                        <Badge variant="outline" className="text-xs gap-1.5">
                                          <Clock className="h-3.5 w-3.5" />
                                          {item.metadata.estimated_time}
                                        </Badge>
                                      )}
                                      
                                      {item.metadata?.difficulty && (
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-xs font-semibold",
                                            item.metadata.difficulty === 'easy' && "border-difficulty-beginner/40 text-difficulty-beginner bg-difficulty-beginner/10",
                                            item.metadata.difficulty === 'medium' && "border-difficulty-intermediate/40 text-difficulty-intermediate bg-difficulty-intermediate/10",
                                            item.metadata.difficulty === 'hard' && "border-difficulty-advanced/40 text-difficulty-advanced bg-difficulty-advanced/10"
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
                                      <div className="pt-3 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                          <span className="text-base">✏️</span>
                                          <span>Tem notas pessoais</span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                  )}
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
    </div>
  );
};

export default UnifiedChecklistKanban;
