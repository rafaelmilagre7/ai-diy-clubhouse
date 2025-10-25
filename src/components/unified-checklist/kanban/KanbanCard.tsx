import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Link2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { Label } from "./LabelManager";

interface KanbanCardProps {
  item: UnifiedChecklistItem;
  provided: any;
  snapshot: any;
  onTitleUpdate: (itemId: string, newTitle: string) => Promise<void>;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddLabel: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  provided,
  snapshot,
  onTitleUpdate,
  onEdit,
  onDuplicate,
  onDelete,
  onAddLabel
}) => {
  const labels = (item.metadata?.labels || []) as Label[];

  return (
    <div 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        marginBottom: '12px',
        pointerEvents: snapshot.isDragging ? 'none' : 'auto'
      }}
      className={cn(
        "kanban-draggable-card group relative p-4",
        snapshot.isDragging && "is-dragging"
      )}
    >
      {/* Header com Título e Quick Actions */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="flex-1 font-semibold text-base leading-tight text-foreground">
          {item.title}
        </h4>
        {!snapshot.isDragging && (
          <QuickActionsMenu
            item={item}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onAddLabel={onAddLabel}
          />
        )}
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {labels.map((label: Label) => (
            <Badge 
              key={label.id}
              style={{ backgroundColor: label.color }}
              className="text-xs font-medium text-white px-2 py-0.5"
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Descrição Preview */}
      {item.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>
      )}

      {/* Footer com Badges Informativos */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          {item.metadata?.estimated_time && (
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {item.metadata.estimated_time}
            </Badge>
          )}
          
          {item.metadata?.dependencies?.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1 bg-status-warning/5 text-status-warning border-status-warning/20">
              <Link2 className="h-3 w-3" />
              {item.metadata.dependencies.length} dep.
            </Badge>
          )}

          {item.metadata?.resources?.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1 bg-primary/5 text-primary border-primary/20">
              <FileText className="h-3 w-3" />
              {item.metadata.resources.length} recursos
            </Badge>
          )}
          
          {item.notes && (
            <Badge variant="outline" className="text-xs gap-1 bg-status-warning/5 text-status-warning border-status-warning/20">
              <StickyNote className="h-3 w-3" />
              Notas
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(KanbanCard, (prevProps, nextProps) => {
  // ✅ Retornar FALSE quando props mudaram (para re-renderizar)
  // ✅ Retornar TRUE quando props NÃO mudaram (para evitar re-render)
  if (prevProps.item.id !== nextProps.item.id) return false;
  if (prevProps.item.title !== nextProps.item.title) return false;
  if (prevProps.item.column !== nextProps.item.column) return false;
  if (prevProps.item.completed !== nextProps.item.completed) return false;
  if (prevProps.item.order !== nextProps.item.order) return false;
  if (prevProps.snapshot?.isDragging !== nextProps.snapshot?.isDragging) return false;
  
  // Se nada mudou, evitar re-render
  return true;
});
