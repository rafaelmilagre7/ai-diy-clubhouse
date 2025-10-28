import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Eye, StickyNote } from "lucide-react";
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
            {/* Header com step_number */}
            <div className="flex items-start gap-2 mb-1">
              {item.step_number && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 shrink-0">
                  #{item.step_number}
                </Badge>
              )}
              <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug flex-1">
                {item.title || "Sem título"}
              </p>
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
            
            {/* Metadata badges - Framework Rafael Milagre */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.quadrant && item.quadrant !== 'Geral' && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-primary/10 border-primary/30 text-primary"
                >
                  {item.quadrant}
                </Badge>
              )}
              
              {item.difficulty && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    item.difficulty === 'easy' || item.difficulty === 'Fácil' 
                      ? 'bg-system-healthy/10 border-system-healthy/30 text-system-healthy' 
                      : item.difficulty === 'medium' || item.difficulty === 'Média'
                      ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                      : 'bg-status-error/10 border-status-error/30 text-status-error'
                  }`}
                >
                  {item.difficulty === 'easy' ? 'Fácil' : 
                   item.difficulty === 'medium' ? 'Média' : 
                   item.difficulty === 'hard' ? 'Difícil' : item.difficulty}
                </Badge>
              )}
              
              {item.estimated_time && (
                <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                  ⏱️ {item.estimated_time}
                </Badge>
              )}
              
              {item.notes && (
                <Badge variant="outline" className="text-xs">
                  <StickyNote className="h-3 w-3 mr-1" />
                  Notas
                </Badge>
              )}
            </div>

            {/* Tools required */}
            {item.tools_required && item.tools_required.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tools_required.slice(0, 3).map((tool, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    🔧 {tool}
                  </span>
                ))}
                {item.tools_required.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    +{item.tools_required.length - 3}
                  </span>
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
