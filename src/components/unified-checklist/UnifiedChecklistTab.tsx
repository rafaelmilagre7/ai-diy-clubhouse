import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useUnifiedChecklist, 
  useUnifiedChecklistTemplate, 
  useUpdateUnifiedChecklist,
  normalizeChecklistItems,
  type UnifiedChecklistItem,
  type UnifiedChecklistData
} from "@/hooks/useUnifiedChecklists";
import SimpleKanban from "./kanban/SimpleKanban";

interface UnifiedChecklistTabProps {
  solutionId: string;
  checklistType?: 'implementation' | 'user' | 'verification';
  onComplete?: () => void;
}

const UnifiedChecklistTab: React.FC<UnifiedChecklistTabProps> = ({ 
  solutionId, 
  checklistType = 'implementation', 
  onComplete 
}) => {
  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: template, isLoading: isLoadingTemplate } = useUnifiedChecklistTemplate(solutionId, checklistType);
  const { data: userProgress, isLoading: isLoadingProgress } = useUnifiedChecklist(solutionId, checklistType);
  
  console.log('📋 UnifiedChecklistTab - MOUNT:', {
    solutionId,
    checklistType,
    hasTemplate: !!template,
    templateId: template?.id,
    templateIsTemplate: template?.is_template,
    templateItems: template?.checklist_data?.items?.length || 0,
    hasUserProgress: !!userProgress,
    userProgressId: userProgress?.id,
    userProgressUpdatedAt: userProgress?.updated_at,
    userProgressItems: userProgress?.checklist_data?.items?.length || 0,
    isLoadingTemplate,
    isLoadingProgress
  });
  
  // Log detalhado dos primeiros itens
  if (template?.checklist_data?.items?.[0]) {
    console.log('📋 Template FIRST ITEM:', template.checklist_data.items[0]);
  }
  if (userProgress?.checklist_data?.items?.[0]) {
    console.log('📋 UserProgress FIRST ITEM:', userProgress.checklist_data.items[0]);
  }
  
  const updateMutation = useUpdateUnifiedChecklist();

  // Combinar template com progresso para obter lista de items
  const checklistItems: UnifiedChecklistItem[] = React.useMemo(() => {
    console.log('🔀 [UnifiedChecklistTab] Iniciando merge:', {
      hasTemplate: !!template,
      hasUserProgress: !!userProgress,
      templateItems: template?.checklist_data?.items?.length,
      userProgressItems: userProgress?.checklist_data?.items?.length,
      userProgressUpdatedAt: userProgress?.updated_at
    });
    
    if (!template?.checklist_data?.items) return [];
    
    const sourceItems = template.checklist_data.items;
    const progressItems = userProgress?.checklist_data?.items || [];
    
    console.log('🔀 [UnifiedChecklistTab] Source e Progress:', {
      sourceCount: sourceItems.length,
      progressCount: progressItems.length,
      progressAllColumns: progressItems.map((p: any) => ({ id: p.id, title: p.title, column: p.column }))
    });
    
    const mergedItems = sourceItems.map((sourceItem: any) => {
      const progressItem = progressItems.find((p: any) => p.id === sourceItem.id);
      
      if (progressItem) {
        // ✅ Ordem correta: progressItem por último para ter prioridade absoluta
        const merged = Object.assign(
          {},
          sourceItem,           // 1. Base do template (com metadata)
          progressItem,         // 2. Sobrescrever TUDO com progresso
          {
            metadata: sourceItem.metadata  // 3. Restaurar APENAS metadata do template
          }
        );
        
        console.log(`🔀 [UnifiedChecklistTab] Item ${sourceItem.id} merged:`, {
          sourceColumn: sourceItem.column,
          progressColumn: progressItem.column,
          mergedColumn: merged.column,
          priorityFrom: 'userProgress',
          progressItem: progressItem
        });
        
        return merged;
      }
      
      // Se não tem progresso, usar template
      return {
        id: sourceItem.id,
        title: sourceItem.title,
        description: sourceItem.description,
        completed: false,
        notes: '',
        column: sourceItem.column || 'todo',
        order: sourceItem.order,
        metadata: sourceItem.metadata
      };
    });

    console.log('✅ [UnifiedChecklistTab] Merge concluído:', {
      mergedCount: mergedItems.length,
      columnsDistribution: mergedItems.reduce((acc: Record<string, number>, item) => {
        acc[item.column || 'todo'] = (acc[item.column || 'todo'] || 0) + 1;
        return acc;
      }, {}),
      allMergedColumns: mergedItems.map(i => ({ id: i.id, title: i.title, column: i.column }))
    });

    return mergedItems;
  }, [template, userProgress]);

  // Função para atualizar item
  const handleItemUpdate = (itemId: string, isCompleted: boolean, notes?: string) => {
    const updatedItems = checklistItems.map(item => ({
      ...item,
      completed: item.id === itemId ? isCompleted : item.completed,
      notes: item.id === itemId ? (notes !== undefined ? notes : item.notes) : item.notes,
      completedAt: item.id === itemId && isCompleted ? new Date().toISOString() : 
                   item.id === itemId && !isCompleted ? undefined :
                   item.completedAt
    }));
    
    const checklistData: UnifiedChecklistData = {
      id: userProgress?.id,
      user_id: userProgress?.user_id || '',
      solution_id: solutionId,
      template_id: template?.id,
      checklist_type: checklistType,
      checklist_data: {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      },
      completed_items: 0,
      total_items: updatedItems.length,
      progress_percentage: 0,
      is_completed: false,
      is_template: false
    };

    updateMutation.mutate({
      checklistData,
      solutionId,
      checklistType,
      templateId: template?.id
    });
  };

  const handleItemToggle = (itemId: string, isCompleted: boolean) => {
    const item = checklistItems.find(i => i.id === itemId);
    handleItemUpdate(itemId, isCompleted, item?.notes);
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    const item = checklistItems.find(i => i.id === itemId);
    handleItemUpdate(itemId, item?.completed || false, notes);
  };

  // Verificar se todos os itens estão completos para chamar onComplete
  const allCompleted = React.useMemo(() => {
    if (checklistItems.length === 0) return false;
    return checklistItems.every(item => item.completed);
  }, [checklistItems]);

  const completionCalledRef = React.useRef(false);

  useEffect(() => {
    if (allCompleted && onComplete && !completionCalledRef.current) {
      completionCalledRef.current = true;
      onComplete();
    } else if (!allCompleted) {
      completionCalledRef.current = false;
    }
  }, [allCompleted, onComplete]);

  if (isLoadingTemplate || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template || !checklistItems.length) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Checklist em Preparação</h3>
        <p className="text-muted-foreground mb-4">
          O checklist de {checklistType === 'implementation' ? 'implementação' : checklistType} para esta solução ainda está sendo preparado pela nossa equipe.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Este conteúdo será disponibilizado em breve. Enquanto isso, você pode explorar outras partes da solução.
        </p>
        {onComplete && (
          <Button onClick={onComplete} variant="outline">
            Continuar para próxima etapa
          </Button>
        )}
      </div>
    );
  }

  const completedItems = checklistItems.filter(item => item.completed);
  const progressPercentage = Math.round((completedItems.length / checklistItems.length) * 100);

  const getChecklistTitle = () => {
    switch (checklistType) {
      case 'implementation': return 'Checklist de Implementação';
      case 'verification': return 'Checklist de Verificação';
      case 'user': return 'Checklist do Usuário';
      default: return 'Checklist';
    }
  };

  return (
    <div className="space-y-6">
      <SimpleKanban
        checklistItems={checklistItems}
        checklistData={{
          id: userProgress?.id,
          user_id: userProgress?.user_id || '',
          solution_id: solutionId,
          template_id: template?.id,
          checklist_type: checklistType,
          checklist_data: {
            items: checklistItems,
            lastUpdated: new Date().toISOString()
          },
          completed_items: completedItems.length,
          total_items: checklistItems.length,
          progress_percentage: progressPercentage,
          is_completed: allCompleted,
          is_template: false
        }}
        solutionId={solutionId}
        checklistType={checklistType}
      />
    </div>
  );
};

export default UnifiedChecklistTab;