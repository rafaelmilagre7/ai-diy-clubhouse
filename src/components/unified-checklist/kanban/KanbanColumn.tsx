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
  
  // Rastrear se houve movimento para diferenciar clique de drag
  const dragStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const hasMoved = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartPosRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
      
      // Se moveu mais de 5px, considera como drag
      if (deltaX > 5 || deltaY > 5) {
        hasMoved.current = true;
      }
    }
  };

  const handlePointerUp = () => {
    // Se NÃO moveu E não está arrastando, é um clique - abre detalhes
    if (!hasMoved.current && !isDragging && dragStartPosRef.current) {
      onViewDetails(item);
    }
    dragStartPosRef.current = null;
    hasMoved.current = false;
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="transition-all duration-200"
    >
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
      className={`
        flex flex-col h-full 
        transition-all duration-300 ease-out
        ${isOver 
          ? "bg-accent/40 border-2 border-primary shadow-lg ring-2 ring-primary/20" 
          : "bg-card/50 border border-border"
        }
      `}
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
        className={`
          flex-1 p-4 overflow-y-auto min-h-[200px]
          transition-all duration-200
          ${isOver ? 'bg-accent/10' : ''}
        `}
      >
        {items.length === 0 ? (
          <div className={`
            flex items-center justify-center h-full 
            text-muted-foreground text-sm
            transition-all duration-200
            ${isOver 
              ? 'text-primary font-medium scale-105' 
              : ''
            }
          `}>
            {isOver ? '↓ Solte aqui' : 'Nenhuma tarefa'}
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
