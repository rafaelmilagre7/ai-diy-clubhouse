import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Eye, Clock, StickyNote } from "lucide-react";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";

interface SimpleKanbanCardProps {
  item: UnifiedChecklistItem;
  onViewDetails: (item: UnifiedChecklistItem) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const SimpleKanbanCard: React.FC<SimpleKanbanCardProps> = ({
  item,
  onViewDetails,
  isDragging = false,
  isOverlay = false,
}) => {
  return (
    <Card 
      className={`
        p-3 bg-card border border-border
        transition-all duration-200
        group relative
        ${!isOverlay ? 'mb-2 cursor-grab active:cursor-grabbing hover:bg-accent/30 hover:border-primary/50 hover:shadow-md' : ''}
        ${isDragging && !isOverlay ? 'opacity-30 scale-95' : ''}
        ${isOverlay ? 'shadow-2xl ring-2 ring-primary/50 rotate-2 cursor-grabbing' : ''}
      `}
    >
        <div className="flex items-start gap-3">
          {/* Drag Handle - Apenas visual */}
          <div className="mt-1 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
              {item.title || "Sem título"}
            </p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
            
            {/* Metadata badges */}
            {(item.metadata?.estimated_time || item.notes) && (
              <div className="flex gap-1.5 mt-2">
                {item.metadata?.estimated_time && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.metadata.estimated_time}
                  </Badge>
                )}
                {item.notes && (
                  <Badge variant="outline" className="text-xs">
                    <StickyNote className="h-3 w-3 mr-1" />
                    Notas
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* View Details Button - Visível apenas quando não está em overlay */}
          {!isOverlay && (
            <Button
              variant="ghost"
              size="sm"
              title="Ver detalhes da tarefa"
              className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-accent shrink-0 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onViewDetails(item);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
    </Card>
  );
};

export default SimpleKanbanCard;
