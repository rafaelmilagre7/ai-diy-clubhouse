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
import { 
  useUnifiedChecklist, 
  useUnifiedChecklistTemplate, 
  useUpdateUnifiedChecklist,
  type UnifiedChecklistItem,
  type UnifiedChecklistData
} from "@/hooks/useUnifiedChecklists";

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
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [showSaveButtons, setShowSaveButtons] = useState<Record<string, boolean>>({});

  // Buscar template e progresso do usuário
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
  
  const updateMutation = useUpdateUnifiedChecklist();

  // Combinar template/checklist com progresso para obter lista de items
  const checklistItems: UnifiedChecklistItem[] = React.useMemo(() => {
    // Priorizar template, depois checklist específico da solução
    const sourceChecklist = template || solutionChecklist;
    
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
        completedAt: progressItem?.completedAt
      };
    });
  }, [template, solutionChecklist, userProgress]);

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

  // Sincronizar itemNotes com checklistItems quando carregarem
  useEffect(() => {
    if (checklistItems.length > 0) {
      const notesMap: Record<string, string> = {};
      checklistItems.forEach(item => {
        notesMap[item.id] = item.notes || '';
      });
      setItemNotes(notesMap);
    }
  }, [checklistItems]);

  if (isLoadingTemplate || isLoadingProgress || isLoadingSolutionChecklist || isLoadingAlternative) {
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
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
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

  if ((!template && !solutionChecklist && !alternativeChecklist) || !checklistItems.length) {
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
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{getChecklistTitle()}</h2>
        <p className="text-muted-foreground">
          Confirme cada etapa conforme você progride na solução
        </p>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Progresso Geral</h3>
          <span className="text-sm text-muted-foreground">
            {completedItems.length} de {checklistItems.length} itens
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progressPercentage}% concluído
        </p>
      </Card>

      <div className="space-y-4">
        {checklistItems.map((item) => {
          const currentNotes = itemNotes[item.id] || '';
          const showNotesSave = showSaveButtons[item.id] || false;

          const handleNotesLocalChange = (value: string) => {
            setItemNotes(prev => ({ ...prev, [item.id]: value }));
            setShowSaveButtons(prev => ({ ...prev, [item.id]: value !== (item.notes || '') }));
          };

          const saveNotes = () => {
            handleNotesChange(item.id, currentNotes);
            setShowSaveButtons(prev => ({ ...prev, [item.id]: false }));
          };
          
          return (
            <Card key={item.id} className={cn(
              "p-4 transition-all duration-300 border-2",
              item.completed ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      handleItemToggle(item.id, checked as boolean)
                    }
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.completed && (
                        <Badge className="bg-primary/20 text-primary text-xs">
                          Concluído
                        </Badge>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-7 space-y-2">
                <Textarea
                  placeholder="Adicione suas notas sobre esta etapa..."
                  value={currentNotes}
                  onChange={(e) => handleNotesLocalChange(e.target.value)}
                  className="min-h-20"
                  disabled={updateMutation.isPending}
                />
                  {showNotesSave && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={saveNotes}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Salvando...' : 'Salvar notas'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {completedItems.length === checklistItems.length && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Parabéns! Todos os itens foram concluídos! 
              {onComplete && " Você pode avançar para a próxima etapa."}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UnifiedChecklistTab;