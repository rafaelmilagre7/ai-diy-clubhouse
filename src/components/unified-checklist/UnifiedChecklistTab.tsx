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
import UnifiedChecklistKanban from "./UnifiedChecklistKanban";

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
  
  console.log('📋 UnifiedChecklistTab:', {
    solutionId,
    checklistType,
    hasTemplate: !!template,
    hasUserProgress: !!userProgress,
    isLoadingTemplate,
    isLoadingProgress
  });
  
  // Buscar checklist específico da solução se não houver template
  const { data: solutionChecklist, isLoading: isLoadingSolutionChecklist } = useQuery({
    queryKey: ['solution-checklist', solutionId, checklistType],
    queryFn: async () => {
      console.log('🔍 Buscando checklist específico da solução:', { solutionId, checklistType });
      
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar checklist da solução:', error);
        return null;
      }

      console.log('✅ Checklist da solução encontrado:', !!data);
      return data;
    },
    enabled: !!solutionId && !template && !isLoadingTemplate
  });

  // Buscar checklist alternativo se não houver do tipo solicitado
  const { data: alternativeChecklist, isLoading: isLoadingAlternative } = useQuery({
    queryKey: ['alternative-checklist', solutionId],
    queryFn: async () => {
      console.log('🔍 Buscando checklist alternativo para solução:', solutionId);
      
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('is_template', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar checklist alternativo:', error);
        return null;
      }

      console.log('✅ Checklist alternativo encontrado:', !!data, data?.checklist_type);
      return data;
    },
    enabled: !!solutionId && !template && !solutionChecklist && !isLoadingTemplate && !isLoadingSolutionChecklist
  });

  // 🆕 FALLBACK FINAL: Buscar implementation_checklist diretamente da solução
  const { data: solutionDirectChecklist, isLoading: isLoadingDirect } = useQuery({
    queryKey: ['solution-direct-checklist', solutionId],
    queryFn: async () => {
      console.log('🔍 [FALLBACK] Buscando implementation_checklist diretamente de ai_generated_solutions:', solutionId);
      
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('implementation_checklist')
        .eq('id', solutionId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar checklist direto:', error);
        return null;
      }

      if (!data?.implementation_checklist || !Array.isArray(data.implementation_checklist)) {
        console.log('⚠️ implementation_checklist não encontrado ou inválido');
        return null;
      }

      console.log('✅ Checklist direto encontrado:', data.implementation_checklist.length, 'items');
      
      // Converter formato antigo para novo formato unified_checklists
      return {
        id: `direct-${solutionId}`,
        solution_id: solutionId,
        checklist_type: checklistType,
        is_template: false,
        checklist_data: {
          items: data.implementation_checklist.map((step: any, index: number) => ({
            id: `step-${index + 1}`,
            title: step.title || `Etapa ${step.step_number || index + 1}`,
            description: step.description || '',
            completed: false,
            notes: '',
            metadata: {
              step_number: step.step_number,
              estimated_time: step.estimated_time,
              difficulty: step.difficulty,
              dependencies: step.dependencies,
              validation_criteria: step.validation_criteria,
              common_pitfalls: step.common_pitfalls,
              resources: step.resources
            }
          })),
          lastUpdated: new Date().toISOString()
        }
      };
    },
    enabled: !!solutionId && 
             !template && 
             !solutionChecklist && 
             !alternativeChecklist && 
             !isLoadingTemplate && 
             !isLoadingSolutionChecklist && 
             !isLoadingAlternative
  });
  
  const updateMutation = useUpdateUnifiedChecklist();

  // Combinar template/checklist com progresso para obter lista de items
  const checklistItems: UnifiedChecklistItem[] = React.useMemo(() => {
    // Priorizar: template > checklist específico > checklist direto da solução
    const sourceChecklist = template || solutionChecklist || solutionDirectChecklist;
    
    if (!sourceChecklist?.checklist_data?.items) return [];
    
    const sourceItems = sourceChecklist.checklist_data.items;
    const progressItems = userProgress?.checklist_data?.items || [];
    
    return sourceItems.map((sourceItem: any) => {
      const progressItem = progressItems.find((p: any) => p.id === sourceItem.id);
      
      return {
        id: sourceItem.id,
        title: sourceItem.title,
        description: sourceItem.description,
        completed: progressItem?.completed || false,
        notes: progressItem?.notes || '',
        completedAt: progressItem?.completedAt,
        metadata: sourceItem.metadata // 🆕 preservar metadados extras
      };
    });
  }, [template, solutionChecklist, solutionDirectChecklist, userProgress]);

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

    const sourceChecklist = template || solutionChecklist;
    
    const checklistData: UnifiedChecklistData = {
      id: userProgress?.id,
      user_id: userProgress?.user_id || '',
      solution_id: solutionId,
      template_id: sourceChecklist?.id,
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
      templateId: sourceChecklist?.id
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

  if (isLoadingTemplate || isLoadingProgress || isLoadingSolutionChecklist || isLoadingAlternative || isLoadingDirect) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não há template nem checklist específico, mas há alternativo, mostrar aviso amigável
  if ((!template && !solutionChecklist) && alternativeChecklist) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-status-warning mb-4" />
        <h3 className="text-lg font-semibold mb-2">Checklist Disponível em Outro Formato</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução possui um checklist do tipo <Badge variant="outline">{alternativeChecklist.checklist_type}</Badge>, 
          mas não especificamente de <Badge variant="outline">{checklistType}</Badge>.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Visite a aba correspondente ou entre em contato com nossa equipe para mais informações.
        </p>
        {onComplete && (
          <Button onClick={onComplete} variant="outline">
            Continuar para próxima etapa
          </Button>
        )}
      </div>
    );
  }

  if ((!template && !solutionChecklist && !alternativeChecklist && !solutionDirectChecklist) || !checklistItems.length) {
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
      <UnifiedChecklistKanban
        checklistItems={normalizeChecklistItems(checklistItems)}
        checklistData={{
          id: userProgress?.id,
          user_id: userProgress?.user_id || '',
          solution_id: solutionId,
          template_id: (template || solutionChecklist)?.id,
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
        templateId={(template || solutionChecklist)?.id}
      />
    </div>
  );
};

export default UnifiedChecklistTab;