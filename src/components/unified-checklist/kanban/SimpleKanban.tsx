import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
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
  const [isDragging, setIsDragging] = useState(false);

  const updateMutation = useUpdateUnifiedChecklist();

  // Refs para evitar stale closures
  const checklistDataRef = useRef(checklistData);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

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
    setIsDragging(false); // Reset
    
    // Capturar posição inicial do mouse/touch
    const activatorEvent = event.activatorEvent as MouseEvent | TouchEvent;
    if ('clientX' in activatorEvent) {
      dragStartPosRef.current = { x: activatorEvent.clientX, y: activatorEvent.clientY };
    } else if ('touches' in activatorEvent && activatorEvent.touches[0]) {
      dragStartPosRef.current = { 
        x: activatorEvent.touches[0].clientX, 
        y: activatorEvent.touches[0].clientY 
      };
    }
    
    console.log("🟢 DRAG START:", { 
      id: event.active.id, 
      isDragging: false,
      pos: dragStartPosRef.current 
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // Marcar que houve movimento real (não é apenas um clique)
    const moved = event.delta.x !== 0 || event.delta.y !== 0;
    if (!isDragging && moved) {
      console.log("🔄 MOVEMENT DETECTED:", event.delta);
      setIsDragging(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log("🔵 DRAG END:", { 
      activeId: active.id, 
      overId: over?.id,
      wasDragging: isDragging,
      hasOver: !!over
    });
    
    const itemId = active.id as string;
    
    // SE NÃO HOUVE DRAG REAL (clique simples)
    if (!isDragging) {
      console.log("👆 CLIQUE DETECTADO - Abrindo modal");
      const clickedItem = localItems.find(item => item.id === itemId);
      if (clickedItem) {
        console.log("✅ Item encontrado:", clickedItem.title);
        handleViewDetails(clickedItem);
      } else {
        console.log("❌ Item não encontrado:", itemId);
      }
      setActiveId(null);
      setIsDragging(false);
      return; // NÃO processar como drag
    }
    
    console.log("🎯 PROCESSANDO DRAG - movendo card");
    setActiveId(null);
    setIsDragging(false);

    if (!over) {
      console.log("⚠️ No drop target");
      return;
    }
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

    // Atualizar estado local imediatamente (UI otimista)
    setLocalItems((prev) => {
      return prev.map((item) =>
        item.id === itemId ? { ...item, column: mappedColumn } : item
      );
    });

    // Cancelar timeout anterior (debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: salvar após 300ms (permite múltiplos drags rápidos)
    saveTimeoutRef.current = setTimeout(() => {
      // Usar dados mais recentes da ref
      const currentChecklistData = checklistDataRef.current;
      
      if (!currentChecklistData.id) {
        console.error("❌ Checklist ID não encontrado, não é possível salvar");
        toast.error("Erro: checklist não inicializado");
        return;
      }

      // Pegar estado atualizado dos items
      setLocalItems((currentItems) => {
        // Calcular progresso baseado no estado atual
        const completedCount = currentItems.filter(item => item.completed).length;
        const totalCount = currentItems.length;
        const progressPercent = Math.round((completedCount / totalCount) * 100);

        // Preparar dados para salvar
        const updatedChecklistData: UnifiedChecklistData = {
          ...currentChecklistData,
          checklist_data: {
            items: currentItems,
            lastUpdated: new Date().toISOString()
          },
          completed_items: completedCount,
          total_items: totalCount,
          progress_percentage: progressPercent,
          is_completed: completedCount === totalCount && totalCount > 0,
        };

        console.log("💾 Salvando mudança de coluna:", {
          itemId,
          newColumn: mappedColumn,
          checklistId: currentChecklistData.id
        });

        // Salvar no banco (FORA do setState)
        updateMutation.mutate({
          checklistData: updatedChecklistData,
          solutionId,
          checklistType,
          templateId: currentChecklistData.template_id,
        }, {
          onError: (error) => {
            console.error("❌ Erro ao salvar:", error);
            toast.error("Erro ao salvar alteração");
            // Reverter para dados originais
            setLocalItems(checklistItems);
          },
          onSuccess: () => {
            console.log("✅ Alteração salva com sucesso");
          },
        });

        // Retornar estado atual (sem modificar)
        return currentItems;
      });
    }, 300);
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
        onDragMove={handleDragMove}
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
