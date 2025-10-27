import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";
import SimpleKanbanCard from "./SimpleKanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  items: UnifiedChecklistItem[];
  onViewDetails: (item: UnifiedChecklistItem) => void;
}

interface DraggableCardProps {
  item: UnifiedChecklistItem;
  onViewDetails: (item: UnifiedChecklistItem) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ item, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <SimpleKanbanCard 
        item={item} 
        onViewDetails={onViewDetails}
        isDragging={isDragging}
      />
    </div>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  items,
  onViewDetails,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card
      className={`flex flex-col h-full transition-colors ${
        isOver ? "bg-accent/30 border-primary" : "bg-card/50"
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? "tarefa" : "tarefas"}
        </p>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 overflow-y-auto min-h-[200px]"
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Nenhuma tarefa
          </div>
        ) : (
          items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default KanbanColumn;
