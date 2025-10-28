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
import { Card } from "@/components/ui/card";
import { UnifiedChecklistItem, UnifiedChecklistData, useUpdateUnifiedChecklist } from "@/hooks/useUnifiedChecklists";
import KanbanColumn from "./KanbanColumn";
import SimpleKanbanCard from "./SimpleKanbanCard";
import { ChecklistCardModal } from "../ChecklistCardModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

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
  const { user } = useAuth(); // ✅ Garantir acesso ao user_id
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localItems, setLocalItems] = useState<UnifiedChecklistItem[]>(checklistItems);

  const updateMutation = useUpdateUnifiedChecklist();

  // Refs para evitar stale closures
  const checklistDataRef = useRef(checklistData);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const solutionIdRef = useRef(solutionId);
  const checklistTypeRef = useRef(checklistType);

  // Atualizar refs quando valores mudarem
  useEffect(() => {
    checklistDataRef.current = checklistData;
    solutionIdRef.current = solutionId;
    checklistTypeRef.current = checklistType;
  }, [checklistData, solutionId, checklistType]);

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
    
    // 🐛 FASE 5: DEBUG LOGS - Diagnosticar estrutura dos items
    if (checklistItems.length > 0) {
      console.log('🎨 [SimpleKanban] Items recebidos:', {
        count: checklistItems.length,
        firstItem: {
          id: checklistItems[0].id,
          title: checklistItems[0].title,
          hasQuadrant: !!checklistItems[0].quadrant,
          hasStepNumber: !!checklistItems[0].step_number,
          hasTools: !!checklistItems[0].tools_required,
          hasEstimatedTime: !!checklistItems[0].estimated_time,
          hasDifficulty: !!checklistItems[0].difficulty,
          quadrant: checklistItems[0].quadrant,
          step_number: checklistItems[0].step_number,
          tools_required: checklistItems[0].tools_required,
          estimated_time: checklistItems[0].estimated_time,
          difficulty: checklistItems[0].difficulty,
        },
        allColumns: checklistItems.map(i => i.column),
        columnsDistribution: {
          todo: checklistItems.filter(i => i.column === 'todo').length,
          in_progress: checklistItems.filter(i => i.column === 'in_progress').length,
          done: checklistItems.filter(i => i.column === 'done').length,
        }
      });
    } else {
      console.warn('🎨 [SimpleKanban] ⚠️ Nenhum item recebido! checklistItems está vazio.');
    }
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

  // 🛡️ FASE 3: Validação de Items
  const hasValidItems = React.useMemo(() => {
    return localItems.length > 0 && localItems.every(item => 
      item.id && 
      item.title && 
      ['todo', 'in_progress', 'done'].includes(item.column || 'todo')
    );
  }, [localItems]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const newColumn = over.id as ("todo" | "in_progress" | "done");

    // Atualizar estado local IMEDIATAMENTE para feedback visual
    setLocalItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, column: newColumn } : item
      )
    );

    // Cancelar timeout anterior (debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: salvar após 500ms
    saveTimeoutRef.current = setTimeout(() => {
      // Pegar os dados ATUALIZADOS diretamente do estado
      setLocalItems((currentItems) => {
        const currentChecklistData = checklistDataRef.current;
        const currentSolutionId = solutionIdRef.current;
        const currentChecklistType = checklistTypeRef.current;

        // Calcular progresso
        const completedCount = currentItems.filter(item => item.completed).length;
        const totalCount = currentItems.length;
        const progressPercent = Math.round((completedCount / totalCount) * 100);

        // Preparar dados com items ATUALIZADOS
        const updatedChecklistData: UnifiedChecklistData = {
          ...currentChecklistData,
          user_id: currentChecklistData.user_id || user?.id || '',
          checklist_data: {
            items: currentItems,
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
          solutionId: currentSolutionId,
          checklistType: currentChecklistType,
          templateId: currentChecklistData.template_id,
        }, {
          onError: () => {
            toast.error("Erro ao salvar alteração");
            setLocalItems(checklistItems);
          },
          onSuccess: (savedData) => {
            toast.success("Posição salva!");
            
            // Atualizar checklistDataRef com o novo ID (caso seja INSERT)
            if (!currentChecklistData.id && savedData.id) {
              checklistDataRef.current = { ...checklistDataRef.current, id: savedData.id };
            }
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

  // 🛡️ FASE 3: Renderizar placeholder se não houver items válidos
  if (!hasValidItems) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          ⚠️ Não há tarefas válidas para exibir no Kanban.
        </p>
        <p className="text-sm text-muted-foreground">
          Verifique se o checklist foi gerado corretamente ou tente regenerá-lo.
        </p>
      </Card>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px] md:h-[calc(100vh-300px)]">
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
