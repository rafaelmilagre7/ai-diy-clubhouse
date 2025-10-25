import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";
import SimpleKanbanCard from "./SimpleKanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  items: UnifiedChecklistItem[];
  totalTasks: number;
  completedTasks: number;
  onViewDetails: (item: UnifiedChecklistItem) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  items,
  totalTasks,
  completedTasks,
  onViewDetails,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Calcular progresso global do checklist
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <Card
      className={`flex flex-col h-full transition-colors ${
        isOver ? "bg-accent/30 border-primary" : "bg-card/50"
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="text-xs font-medium text-muted-foreground">
            {completedTasks}/{totalTasks}
          </span>
        </div>
        
        {/* Progress Bar Global */}
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-1.5" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {progressPercentage}% completo
            </p>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "tarefa" : "tarefas"}
            </p>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 overflow-y-auto min-h-[200px]"
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Nenhuma tarefa
            </div>
          ) : (
            items.map((item) => (
              <SimpleKanbanCard
                key={item.id}
                item={item}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </SortableContext>
      </div>
    </Card>
  );
};

export default KanbanColumn;
