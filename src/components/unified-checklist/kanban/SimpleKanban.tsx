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
import { AlertCircle } from "lucide-react";
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
  onAllCompleted?: boolean;
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
  onAllCompleted,
}) => {
  const { user } = useAuth(); // ✅ Garantir acesso ao user_id
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localItems, setLocalItems] = useState<UnifiedChecklistItem[]>(checklistItems);

  const updateMutation = useUpdateUnifiedChecklist();

  // 🛡️ AJUSTE FINAL 1: Validar user_id antes de permitir interação
  if (!user?.id) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-warning mb-4" />
        <p className="text-foreground font-semibold mb-2">
          Aguarde a autenticação...
        </p>
        <p className="text-sm text-muted-foreground">
          Carregando seus dados de usuário.
        </p>
      </Card>
    );
  }

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

  // 🛡️ FASE 4: VALIDAÇÃO PRECOCE - Antes de qualquer processamento
  const hasValidItems = React.useMemo(() => {
    // ✅ Array vazio é válido (kanban vazio funcional)
    if (checklistItems.length === 0) {
      return true;
    }
    
    // ❌ Se tem items, TODOS devem ser válidos
    const isValid = checklistItems.every(item => 
      item.id && 
      typeof item.id === 'string' &&
      item.title && 
      typeof item.title === 'string' &&
      ['todo', 'in_progress', 'done'].includes(item.column || 'todo')
    );
    
    if (!isValid) {
      console.error('[SIMPLE-KANBAN] ⚠️ Items inválidos detectados:', {
        total: checklistItems.length,
        invalidItems: checklistItems.filter(item => 
          !item.id || !item.title || !['todo', 'in_progress', 'done'].includes(item.column || 'todo')
        )
      });
    }
    
    return isValid;
  }, [checklistItems]);

  // Configurar sensores para drag com menor distância (mais responsivo)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Menor distância = mais responsivo (estilo Trello)
      },
    })
  );

  // 🔥 CORREÇÃO CRÍTICA: Hash para detectar mudanças SEM dependência circular
  const previousHashRef = useRef<string>('');

  // Atualizar localItems quando checklistItems mudar
  useEffect(() => {
    // ⚠️ Só processar se items forem válidos
    if (!hasValidItems) {
      console.warn('[SIMPLE-KANBAN] ⚠️ Pulando atualização - items inválidos');
      return;
    }

    // 🔥 CORREÇÃO: Usar hash simples ao invés de comparação com localItems
    const itemsHash = checklistItems.map(i => `${i.id}:${i.column}:${i.completed}`).join('|');
    
    if (previousHashRef.current === itemsHash) {
      return; // Items não mudaram - não fazer nada
    }
    
    console.log('🎨 [SimpleKanban] Items mudaram - atualizando localItems');
    previousHashRef.current = itemsHash;
    setLocalItems(checklistItems);
  }, [checklistItems, hasValidItems]); // ← SEM localItems para evitar loop

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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const newColumn = over.id as ("todo" | "in_progress" | "done");

    // ✅ Atualizar estado local IMEDIATAMENTE com sincronização de completed
    setLocalItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId 
          ? { 
              ...item, 
              column: newColumn,
              completed: newColumn === 'done', // ✅ Sincronizar completed com column
              completedAt: newColumn === 'done' ? new Date().toISOString() : undefined
            } 
          : item
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

        // ✅ Preparar dados com items ATUALIZADOS e logs detalhados
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

        console.log('💾 [SimpleKanban] Salvando progresso:', {
          user_id: updatedChecklistData.user_id,
          solution_id: currentSolutionId,
          completed: completedCount,
          total: totalCount,
          progress: progressPercent,
          itemsCount: currentItems.length
        });

        // Salvar no banco
        updateMutation.mutate({
          checklistData: updatedChecklistData,
          solutionId: currentSolutionId,
          checklistType: currentChecklistType,
          templateId: currentChecklistData.template_id,
        }, {
          onError: (error) => {
            console.error('❌ [SimpleKanban] Erro ao salvar:', error);
            toast.error("Erro ao salvar alteração");
            setLocalItems(checklistItems);
          },
          onSuccess: (savedData) => {
            console.log('✅ [SimpleKanban] Progresso salvo com sucesso!', savedData);
            toast.success("Posição salva!");
            
            // Atualizar checklistDataRef com o novo ID (caso seja INSERT)
            if (!currentChecklistData.id && savedData?.id) {
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

  // 🛡️ FASE 4: Renderizar placeholder SE não houver items válidos
  if (!hasValidItems) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-warning mb-4" />
        <p className="text-foreground font-semibold mb-2">
          ⚠️ Dados do checklist inválidos
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Algumas tarefas estão com dados incorretos e não podem ser exibidas.
        </p>
        <p className="text-xs text-muted-foreground">
          Tente recarregar a página ou entre em contato com o suporte.
        </p>
      </Card>
    );
  }

  // ✅ Renderizar kanban vazio funcional quando não há items
  if (checklistItems.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        {COLUMNS.map((column) => (
          <Card key={column.id} className="flex flex-col h-full bg-card/50 border border-dashed">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">0 tarefas</p>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground text-sm">
              Nenhuma tarefa
            </div>
          </Card>
        ))}
      </div>
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
