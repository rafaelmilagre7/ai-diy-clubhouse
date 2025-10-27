import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
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
  { id: "in_progress", title: "Em Progresso" },
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

  // Refs para evitar stale closures
  const checklistDataRef = useRef(checklistData);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Atualizar ref quando checklistData mudar
  useEffect(() => {
    checklistDataRef.current = checklistData;
  }, [checklistData]);

  // Configurar sensores para drag com menor distância (mais responsivo)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Menor distância = mais responsivo (estilo Trello)
      },
    })
  );

  // Atualizar localItems quando checklistItems mudar
  useEffect(() => {
    console.log("🔄 [SimpleKanban] checklistItems mudou, atualizando localItems:", {
      itemsCount: checklistItems.length,
      firstItemColumn: checklistItems[0]?.column,
      firstItemTitle: checklistItems[0]?.title,
      checklistId: checklistData.id,
      checklistUpdatedAt: checklistData.updated_at
    });
    setLocalItems(checklistItems);
  }, [checklistItems, checklistData.id, checklistData.updated_at]);

  // Agrupar items por coluna
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, UnifiedChecklistItem[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    localItems.forEach((item) => {
      const column = item.column || "todo";
      if (grouped[column]) {
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
    
    setActiveId(null);

    if (!over) {
      console.log("⚠️ No drop target");
      return;
    }

    const itemId = active.id as string;
    const newColumn = over.id as ("todo" | "in_progress" | "done");
    
    const oldItem = localItems.find(i => i.id === itemId);
    console.log("🎯 [SimpleKanban] handleDragEnd:", { 
      itemId, 
      itemTitle: oldItem?.title,
      oldColumn: oldItem?.column,
      newColumn,
      checklistId: checklistData.id
    });

    // Atualizar estado local IMEDIATAMENTE para feedback visual
    setLocalItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item.id === itemId ? { ...item, column: newColumn } : item
      );
      console.log("✅ [SimpleKanban] Local state atualizado imediatamente");
      return updated;
    });

    // Cancelar timeout anterior (debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: salvar após 500ms
    saveTimeoutRef.current = setTimeout(() => {
      console.log("⏰ [SimpleKanban] Timeout acionado, iniciando salvamento...");
      
      // Pegar os dados ATUALIZADOS diretamente do estado
      setLocalItems((currentItems) => {
        const currentChecklistData = checklistDataRef.current;
        const itemToSave = currentItems.find(i => i.id === itemId);
        
        if (!currentChecklistData.id) {
          console.error("❌ [SimpleKanban] Checklist ID não encontrado");
          toast.error("Erro: checklist não inicializado");
          return currentItems;
        }

        console.log("💾 [SimpleKanban] Preparando para salvar:", {
          itemId,
          itemTitle: itemToSave?.title,
          currentColumn: itemToSave?.column,
          checklistId: currentChecklistData.id,
          allItemsColumns: currentItems.map(i => ({ id: i.id, title: i.title, column: i.column }))
        });

        // Calcular progresso
        const completedCount = currentItems.filter(item => item.completed).length;
        const totalCount = currentItems.length;
        const progressPercent = Math.round((completedCount / totalCount) * 100);

        // Preparar dados com items ATUALIZADOS
        const updatedChecklistData: UnifiedChecklistData = {
          ...currentChecklistData,
          checklist_data: {
            items: currentItems, // ✅ Usar items atualizados
            lastUpdated: new Date().toISOString()
          },
          completed_items: completedCount,
          total_items: totalCount,
          progress_percentage: progressPercent,
          is_completed: completedCount === totalCount && totalCount > 0,
        };

        // Salvar no banco
        updateMutation.mutate({
          checklistData: updatedChecklistData,
          solutionId,
          checklistType,
          templateId: currentChecklistData.template_id,
        }, {
          onError: (error) => {
            console.error("❌ Erro ao salvar:", error);
            toast.error("Erro ao salvar alteração");
            setLocalItems(checklistItems);
          },
          onSuccess: () => {
            console.log("✅ Alteração salva com sucesso");
            toast.success("Card movido com sucesso!");
          },
        });

        return currentItems; // Não modifica o estado
      });
    }, 500);
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
        modifiers={[snapCenterToCursor]}
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

        {/* Drag Overlay - Card seguindo o cursor */}
        <DragOverlay 
          adjustScale={false}
          dropAnimation={{
            duration: 250,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeItem ? (
            <div className="animate-in fade-in duration-150">
              <SimpleKanbanCard
                item={activeItem}
                onViewDetails={() => {}}
                isDragging={false}
                isOverlay={true}
              />
            </div>
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
