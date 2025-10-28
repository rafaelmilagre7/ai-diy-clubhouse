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

  // 🛡️ FASE 1: Normalizar e validar items com logs detalhados
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
    
    // Normalizar items
    const normalized = rawItems.map((item: any, index: number) => {
      // ✅ Garantir que column seja SEMPRE um valor válido
      let validColumn: 'todo' | 'in_progress' | 'done' = 'todo';
      if (item.column === 'in_progress' || item.column === 'in-progress') {
        validColumn = 'in_progress';
      } else if (item.column === 'done') {
        validColumn = 'done';
      }
      
      const normalizedItem: UnifiedChecklistItem = {
        ...item,
        id: item.id || `item-${index}`,
        title: item.title || 'Sem título',
        column: validColumn,
        completed: item.completed || false,
        notes: item.notes || '',
        order: item.order ?? index,
        step_number: item.step_number ?? item.metadata?.step_number,
        quadrant: item.quadrant ?? item.metadata?.quadrant ?? 'Geral',
        tools_required: item.tools_required ?? item.metadata?.tools_required ?? [],
        estimated_time: item.estimated_time ?? item.metadata?.estimated_time,
        difficulty: item.difficulty ?? item.metadata?.difficulty,
      };
      
      // Limpar metadata
      if (normalizedItem.metadata) {
        const { step_number, quadrant, tools_required, estimated_time, difficulty, ...clean } = normalizedItem.metadata;
        normalizedItem.metadata = clean;
      }
      
      return normalizedItem;
    });
    
    // 🛡️ VALIDAÇÃO ROBUSTA: Filtrar items inválidos
    const validated = normalized.filter(item => {
      const isValid = 
        item.id && 
        typeof item.id === 'string' &&
        item.title && 
        typeof item.title === 'string' &&
        ['todo', 'in_progress', 'done'].includes(item.column || 'todo');
      
      if (!isValid) {
        console.error('[VALIDATION] ⚠️ Item inválido detectado e removido:', item);
      }
      
      return isValid;
    });
    
    console.log('[VALIDATION] ✅ Items validados:', {
      total: normalized.length,
      valid: validated.length,
      invalid: normalized.length - validated.length
    });
    
    return validated;
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

  // ✅ Permitir kanban vazio quando não há template
  if (!template && checklistItems.length === 0) {
    const emptyChecklistData: UnifiedChecklistData = {
      user_id: '',
      solution_id: solutionId,
      checklist_type: checklistType,
      checklist_data: { items: [], lastUpdated: new Date().toISOString() },
      completed_items: 0,
      total_items: 0,
      progress_percentage: 0,
      is_completed: false,
      is_template: false
    };

    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Checklist em branco</h3>
          <p className="text-sm text-muted-foreground">
            Esta solução ainda não possui um checklist configurado.
            <br />
            Entre em contato com o suporte para adicionar tarefas.
          </p>
        </div>
        
        <SimpleKanban
          checklistItems={[]}
          checklistData={emptyChecklistData}
          solutionId={solutionId}
          checklistType={checklistType}
        />
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

  // 🔥 CORREÇÃO CRÍTICA: Usar useRef para memoizar hash e evitar recalculações
  const checklistItemsHashRef = React.useRef<string>('');

  const stableChecklistItems = React.useMemo(() => {
    const newHash = checklistItems.length > 0
      ? `${checklistItems.length}|${checklistItems.map(i => `${i.id}:${i.column}:${i.completed ? '1' : '0'}`).sort().join('|')}`
      : '';
    
    // ✅ Só atualizar se hash REALMENTE mudou
    if (checklistItemsHashRef.current !== newHash) {
      checklistItemsHashRef.current = newHash;
    }
    
    return checklistItems;
  }, [checklistItems.length, checklistItemsHashRef.current]);

  // Memoizar timestamp para evitar criar novo objeto a cada render
  const lastUpdatedTimestamp = React.useRef(new Date().toISOString());

  const checklistDataForKanban: UnifiedChecklistData = React.useMemo(() => {
    const completedCount = stableChecklistItems.filter(i => i.completed).length;
    const progressPercent = stableChecklistItems.length > 0 
      ? Math.round((completedCount / stableChecklistItems.length) * 100) 
      : 0;
    
    return {
      id: userProgress?.id,
      user_id: userProgress?.user_id || '', 
      solution_id: solutionId,
      template_id: template?.id,
      checklist_type: checklistType,
      checklist_data: {
        items: stableChecklistItems,
        lastUpdated: lastUpdatedTimestamp.current
      },
      completed_items: completedCount,
      total_items: stableChecklistItems.length,
      progress_percentage: progressPercent,
      is_completed: completedCount === stableChecklistItems.length && stableChecklistItems.length > 0,
      is_template: false
    };
  }, [
    userProgress?.id,
    userProgress?.user_id,
    solutionId,
    template?.id,
    checklistType,
    stableChecklistItems,
  ]);

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