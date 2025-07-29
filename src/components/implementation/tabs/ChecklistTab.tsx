import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChecklistTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  notes?: string;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solutionId, onComplete }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [showSaveButtons, setShowSaveButtons] = useState<Record<string, boolean>>({});

  // Buscar template criado pelos admins
  const { data: checklistTemplate, isLoading } = useQuery({
    queryKey: ['solution-checklist-template', solutionId],
    queryFn: async () => {
      console.log('ChecklistTab: Buscando template para solução:', solutionId);
      
      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('is_template', true)
        .maybeSingle();

      if (error) {
        console.log('ChecklistTab: Nenhum template encontrado:', error);
        return null;
      }
      
      console.log('ChecklistTab: Template encontrado:', data);
      return data;
    }
  });

  // Buscar progresso do usuário
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['user-checklist', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('ChecklistTab: Buscando progresso do usuário:', user.id, solutionId);
      
      const { data, error } = await supabase
        .from('user_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (error) {
        console.log('ChecklistTab: Nenhum progresso encontrado:', error);
        return null;
      }
      
      console.log('ChecklistTab: Progresso encontrado:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Combinar template com progresso para obter lista de items
  const checklistItems: ChecklistItem[] = React.useMemo(() => {
    if (!checklistTemplate?.checkpoint_data?.items) return [];
    
    const templateItems = checklistTemplate.checkpoint_data.items;
    const progressItems = userProgress?.checklist_data?.items || [];
    
    return templateItems.map((templateItem: any) => {
      const progressItem = progressItems.find((p: any) => p.id === templateItem.id);
      
      return {
        id: templateItem.id,
        title: templateItem.title,
        description: templateItem.description,
        completed: progressItem?.completed || false,
        notes: progressItem?.notes || ''
      };
    });
  }, [checklistTemplate, userProgress]);

  // Atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted, notes }: { 
      itemId: string; 
      isCompleted: boolean; 
      notes?: string; 
    }) => {
      if (!user?.id || !checklistTemplate?.id) throw new Error('User or template not found');

      console.log('ChecklistTab: Atualizando progresso:', { itemId, isCompleted, notes });

      // Preparar dados atualizados
      const updatedItems = checklistItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        completed: item.id === itemId ? isCompleted : item.completed,
        notes: item.id === itemId ? (notes || '') : item.notes,
        completedAt: item.id === itemId && isCompleted ? new Date().toISOString() : 
                    item.id === itemId && !isCompleted ? null :
                    item.completed ? new Date().toISOString() : null
      }));

      const completedCount = updatedItems.filter(item => item.completed).length;
      const progressPercentage = Math.round((completedCount / updatedItems.length) * 100);

      const checklistData = {
        items: updatedItems,
        lastUpdated: new Date().toISOString()
      };

      if (userProgress) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('user_checklists')
          .update({
            checklist_data: checklistData,
            progress_percentage: progressPercentage,
            completed_items: completedCount,
            total_items: updatedItems.length,
            is_completed: completedCount === updatedItems.length,
            completed_at: completedCount === updatedItems.length ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userProgress.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('user_checklists')
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            template_id: checklistTemplate.id,
            checklist_data: checklistData,
            progress_percentage: progressPercentage,
            completed_items: completedCount,
            total_items: updatedItems.length,
            is_completed: completedCount === updatedItems.length,
            completed_at: completedCount === updatedItems.length ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['user-checklist', solutionId, user?.id] 
      });
      toast.success('Progresso salvo com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar progresso');
      console.error('Error updating checklist progress:', error);
    }
  });

  const handleItemToggle = (itemId: string, isCompleted: boolean) => {
    const item = checklistItems.find(i => i.id === itemId);
    updateProgressMutation.mutate({ itemId, isCompleted, notes: item?.notes });
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    const item = checklistItems.find(i => i.id === itemId);
    updateProgressMutation.mutate({ itemId, isCompleted: item?.completed || false, notes });
  };

  // Verificar se todos os itens estão completos para chamar onComplete
  useEffect(() => {
    if (checklistItems.length > 0) {
      const allCompleted = checklistItems.every(item => item.completed);
      if (allCompleted) {
        onComplete();
      }
    }
  }, [checklistItems, onComplete]);

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

  if (isLoading || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!checklistTemplate || !checklistItems.length) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Esta solução não possui um checklist de implementação.
        </p>
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    );
  }

  const completedItems = checklistItems.filter(item => item.completed);
  const progressPercentage = Math.round((completedItems.length / checklistItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Checklist de Implementação</h2>
        <p className="text-muted-foreground">
          Confirme cada etapa conforme você implementa a solução
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
                    className="min-h-[80px]"
                  />
                  {showNotesSave && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={saveNotes}
                      disabled={updateProgressMutation.isPending}
                    >
                      Salvar notas
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
              Parabéns! Todos os itens foram concluídos! Você pode avançar para a próxima etapa.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChecklistTab;