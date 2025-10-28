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
  // 🐛 LOG INICIAL - Debug de render
  console.log('🎯 [UnifiedChecklistTab] Render inicial:', {
    solutionId,
    checklistType,
    timestamp: new Date().toISOString()
  });

  const [selectedItem, setSelectedItem] = useState<UnifiedChecklistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: template, isLoading: isLoadingTemplate } = useUnifiedChecklistTemplate(solutionId, checklistType);
  const { data: userProgress, isLoading: isLoadingProgress } = useUnifiedChecklist(solutionId, checklistType);
  
  const updateMutation = useUpdateUnifiedChecklist();

  const checklistItems: UnifiedChecklistItem[] = React.useMemo(() => {
    let rawItems: any[] = [];
    
    if (userProgress?.checklist_data?.items?.length > 0) {
      rawItems = userProgress.checklist_data.items;
    } else if (template?.checklist_data?.items) {
      rawItems = template.checklist_data.items.map((item: any) => ({
        ...item,
        column: item.column || 'todo',
        completed: false,
        notes: ''
      }));
    }
    
    // 🔧 FASE 2: Normalizar items com validação robusta
    return rawItems.map((item: any, index: number) => {
      // ✅ Garantir que column seja SEMPRE um valor válido
      let validColumn: 'todo' | 'in_progress' | 'done' = 'todo';
      if (item.column === 'in_progress' || item.column === 'in-progress') {
        validColumn = 'in_progress';
      } else if (item.column === 'done') {
        validColumn = 'done';
      }
      
      const normalized: UnifiedChecklistItem = {
        ...item,
        id: item.id || `item-${index}`, // ✅ Fallback para ID
        title: item.title || 'Sem título', // ✅ Fallback para título
        column: validColumn,
        completed: item.completed || false,
        notes: item.notes || '',
        order: item.order ?? index,
        // Promover campos (APENAS se não existirem no primeiro nível)
        step_number: item.step_number ?? item.metadata?.step_number,
        quadrant: item.quadrant ?? item.metadata?.quadrant ?? 'Geral',
        tools_required: item.tools_required ?? item.metadata?.tools_required ?? [],
        estimated_time: item.estimated_time ?? item.metadata?.estimated_time,
        difficulty: item.difficulty ?? item.metadata?.difficulty,
      };
      
      // Limpar metadata (remover campos promovidos)
      if (normalized.metadata) {
        const { step_number, quadrant, tools_required, estimated_time, difficulty, ...clean } = normalized.metadata;
        normalized.metadata = clean;
      }
      
      return normalized;
    }).filter(item => item.id && item.title); // ✅ Remover items inválidos
  }, [template, userProgress]);

  // 🐛 FASE 4: Logs de Debug
  React.useEffect(() => {
    console.log('🔍 [UnifiedChecklistTab] Items processados:', {
      source: userProgress ? 'userProgress' : template ? 'template' : 'nenhum',
      rawCount: userProgress?.checklist_data?.items?.length || template?.checklist_data?.items?.length || 0,
      normalizedCount: checklistItems.length,
      firstItem: checklistItems[0],
      isLoadingTemplate,
      isLoadingProgress,
      hasTemplate: !!template,
      hasUserProgress: !!userProgress,
      columnsDistribution: {
        todo: checklistItems.filter(i => i.column === 'todo').length,
        in_progress: checklistItems.filter(i => i.column === 'in_progress').length,
        done: checklistItems.filter(i => i.column === 'done').length,
        invalid: checklistItems.filter(i => !['todo', 'in_progress', 'done'].includes(i.column || 'todo')).length
      }
    });
  }, [checklistItems, userProgress, template, isLoadingTemplate, isLoadingProgress]);

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

  const checklistDataForKanban: UnifiedChecklistData = React.useMemo(() => {
    return {
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
    };
  }, [userProgress, solutionId, template, checklistType, checklistItems, completedItems.length, progressPercentage, allCompleted]);

  return (
    <div className="space-y-6">
      <SimpleKanban
        checklistItems={checklistItems}
        checklistData={checklistDataForKanban}
        solutionId={solutionId}
        checklistType={checklistType}
      />
    </div>
  );
};

export default UnifiedChecklistTab;