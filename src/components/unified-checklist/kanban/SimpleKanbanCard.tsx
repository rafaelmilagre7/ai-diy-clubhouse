import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye } from "lucide-react";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";

interface SimpleKanbanCardProps {
  item: UnifiedChecklistItem;
  onViewDetails: (item: UnifiedChecklistItem) => void;
}

const SimpleKanbanCard: React.FC<SimpleKanbanCardProps> = ({
  item,
  onViewDetails,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-3 mb-2 bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {item.title || "Sem título"}
            </p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {item.description}
              </p>
            )}
          </div>

          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SimpleKanbanCard;
