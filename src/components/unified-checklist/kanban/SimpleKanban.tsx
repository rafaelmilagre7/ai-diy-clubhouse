import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { UnifiedChecklistItem, UnifiedChecklistData, useUpdateUnifiedChecklist } from "@/hooks/useUnifiedChecklists";
import KanbanColumn from "./KanbanColumn";
import SimpleKanbanCard from "./SimpleKanbanCard";
import { ChecklistCardModal } from "../ChecklistCardModal";
import { toast } from "sonner";

interface SimpleKanbanProps {
  checklistItems: UnifiedChecklistItem[];
  checklistData: UnifiedChecklistData;
  solutionId: string;
  checklistType: string;
}

const COLUMNS = [
  { id: "todo", title: "A Fazer" },
  { id: "doing", title: "Em Progresso" },
  { id: "done", title: "Concluído" },
];

const SimpleKanban: React.FC<SimpleKanbanProps> = ({
  checklistItems,
  checklistData,
  solutionId,
  checklistType,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localItems, setLocalItems] = useState<UnifiedChecklistItem[]>(checklistItems);

  const updateMutation = useUpdateUnifiedChecklist();

  // Configurar sensores para drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer mover 8px antes de iniciar drag
      },
    })
  );

  // Atualizar localItems quando checklistItems mudar
  React.useEffect(() => {
    setLocalItems(checklistItems);
  }, [checklistItems]);

  // Agrupar items por coluna
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, UnifiedChecklistItem[]> = {
      todo: [],
      doing: [],
      done: [],
    };

    localItems.forEach((item) => {
      const column = item.column || "todo";
      // Mapear in_progress para doing para compatibilidade com as colunas
      if (column === "in_progress") {
        grouped.doing.push(item);
      } else if (grouped[column]) {
        grouped[column].push(item);
      }
    });

    return grouped;
  }, [localItems]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log("🟢 Drag Start:", event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log("🔵 Drag End:", { activeId: active.id, overId: over?.id });
    
    setActiveId(null);

    if (!over) {
      console.log("⚠️ No drop target");
      return;
    }

    const itemId = active.id as string;
    const newColumn = over.id as string;

    // Mapear colunas para o formato correto
    const columnMap: Record<string, "todo" | "in_progress" | "done"> = {
      todo: "todo",
      doing: "in_progress",
      done: "done",
    };

    const mappedColumn = columnMap[newColumn];
    
    if (!mappedColumn) {
      console.log("⚠️ Invalid column:", newColumn);
      return;
    }

    // Atualizar estado local imediatamente
    setLocalItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, column: mappedColumn } : item
      );
      
      // Calcular progresso
      const completedCount = updated.filter(item => item.completed).length;
      const totalCount = updated.length;
      const progressPercent = Math.round((completedCount / totalCount) * 100);

      // Salvar no banco
      const updatedChecklistData: UnifiedChecklistData = {
        ...checklistData,
        checklist_data: {
          items: updated,
          lastUpdated: new Date().toISOString()
        },
        completed_items: completedCount,
        total_items: totalCount,
        progress_percentage: progressPercent,
        is_completed: completedCount === totalCount,
      };

      updateMutation.mutate({
        checklistData: updatedChecklistData,
        solutionId,
        checklistType,
        templateId: checklistData.template_id,
        silent: true, // Não invalidar query, manter estado local
      }, {
        onError: (error) => {
          console.error("❌ Erro ao atualizar:", error);
          toast.error("Erro ao mover tarefa");
          // Reverter em caso de erro
          setLocalItems(checklistItems);
        },
        onSuccess: () => {
          console.log("✅ Tarefa movida com sucesso");
        },
      });

      return updated;
    });
  };

  const activeItem = useMemo(() => {
    return localItems.find((item) => item.id === activeId);
  }, [activeId, localItems]);

  const handleViewDetails = (item: UnifiedChecklistItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              items={itemsByColumn[column.id] || []}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <SimpleKanbanCard
              item={activeItem}
              onViewDetails={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Detalhes */}
      <ChecklistCardModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onNotesChange={handleNotesChange}
        isUpdating={updateMutation.isPending}
      />
    </>
  );
};

export default SimpleKanban;
