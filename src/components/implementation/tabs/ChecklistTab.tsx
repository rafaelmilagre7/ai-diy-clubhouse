import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
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
  order_index: number;
  is_required: boolean;
}

interface UserChecklistProgress {
  id: string;
  user_id: string;
  solution_id: string;
  checklist_item_id: string;
  is_completed: boolean;
  notes?: string;
  completed_at?: string;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solutionId, onComplete }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: checklistItems, isLoading } = useQuery({
    queryKey: ['solution-checklist', solutionId],
    queryFn: async () => {
      console.log('ChecklistTab: Buscando checklist para solução:', solutionId);
      
      // Buscar o checklist criado pelo admin na tabela implementation_checkpoints
      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .select('checkpoint_data')
        .eq('solution_id', solutionId)
        .limit(1)
        .single();

      if (error) {
        console.log('ChecklistTab: Nenhum checklist encontrado:', error);
        return [];
      }
      
      console.log('ChecklistTab: Dados encontrados:', data);
      
      // Extrair os items do checkpoint_data
      const items = data?.checkpoint_data?.items || [];
      
      console.log('ChecklistTab: Items do checklist:', items);
      
      // Transformar para o formato esperado
      return items.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        title: item.title,
        description: item.description,
        order_index: index,
        is_required: true // Todos os items do admin são obrigatórios por padrão
      }));
    }
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-checklist-progress', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('ChecklistTab: Buscando progresso do usuário:', user.id, solutionId);
      
      // Buscar o progresso do usuário para esta solução
      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();

      if (error) {
        console.log('ChecklistTab: Nenhum progresso encontrado:', error);
        return [];
      }
      
      console.log('ChecklistTab: Progresso encontrado:', data);
      
      // Extrair progresso dos items
      const items = data?.checkpoint_data?.items || [];
      return items.map((item: any) => ({
        id: item.id,
        user_id: user.id,
        solution_id: solutionId,
        checklist_item_id: item.id,
        is_completed: item.completed || false,
        notes: item.notes || '',
        completed_at: item.completed ? new Date().toISOString() : null
      }));
    },
    enabled: !!user?.id
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted, itemNotes }: { 
      itemId: string; 
      isCompleted: boolean; 
      itemNotes?: string; 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('ChecklistTab: Atualizando progresso:', { itemId, isCompleted, itemNotes });

      // Buscar dados atuais
      const { data: currentData } = await supabase
        .from('implementation_checkpoints')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();

      let checkpointData;
      let completedSteps: string[] = [];

      if (currentData) {
        // Atualizar dados existentes
        checkpointData = { ...currentData.checkpoint_data };
        if (!checkpointData.items) checkpointData.items = [];
        
        // Atualizar o item específico
        const itemIndex = checkpointData.items.findIndex((item: any) => item.id === itemId);
        if (itemIndex >= 0) {
          checkpointData.items[itemIndex] = {
            ...checkpointData.items[itemIndex],
            completed: isCompleted,
            notes: itemNotes || '',
            completedAt: isCompleted ? new Date().toISOString() : null
          };
        }

        // Calcular steps completados
        completedSteps = checkpointData.items
          .map((item: any, index: number) => item.completed ? String(index) : null)
          .filter(Boolean);

      } else {
        // Criar novos dados baseados no template do admin
        const { data: adminData } = await supabase
          .from('implementation_checkpoints')
          .select('checkpoint_data')
          .eq('solution_id', solutionId)
          .limit(1)
          .single();

        if (adminData?.checkpoint_data?.items) {
          checkpointData = {
            items: adminData.checkpoint_data.items.map((item: any) => ({
              ...item,
              completed: item.id === itemId ? isCompleted : false,
              notes: item.id === itemId ? (itemNotes || '') : '',
              completedAt: item.id === itemId && isCompleted ? new Date().toISOString() : null
            })),
            lastUpdated: new Date().toISOString()
          };

          completedSteps = checkpointData.items
            .map((item: any, index: number) => item.completed ? String(index) : null)
            .filter(Boolean);
        }
      }

      const progressPercentage = checkpointData?.items?.length > 0 
        ? Math.round((completedSteps.length / checkpointData.items.length) * 100)
        : 0;

      // Upsert no banco
      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .upsert({
          user_id: user.id,
          solution_id: solutionId,
          checkpoint_data: checkpointData,
          completed_steps: completedSteps,
          total_steps: checkpointData?.items?.length || 0,
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,solution_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['user-checklist-progress', solutionId, user?.id] 
      });
    },
    onError: (error) => {
      toast.error('Erro ao salvar progresso');
      console.error('Error updating checklist progress:', error);
    }
  });

  const handleItemToggle = (itemId: string, isCompleted: boolean) => {
    const itemNotes = notes[itemId] || '';
    updateProgressMutation.mutate({ itemId, isCompleted, itemNotes });
  };

  const handleNotesChange = (itemId: string, value: string) => {
    setNotes(prev => ({ ...prev, [itemId]: value }));
  };

  const saveNotes = (itemId: string) => {
    const existingProgress = userProgress?.find(p => p.checklist_item_id === itemId);
    updateProgressMutation.mutate({ 
      itemId, 
      isCompleted: existingProgress?.is_completed || false, 
      itemNotes: notes[itemId] 
    });
  };

  const getItemProgress = (itemId: string) => {
    return userProgress?.find(p => p.checklist_item_id === itemId);
  };

  useEffect(() => {
    if (checklistItems && userProgress) {
      const requiredItems = checklistItems.filter(item => item.is_required);
      const completedRequiredItems = requiredItems.filter(item => 
        getItemProgress(item.id)?.is_completed
      );

      if (requiredItems.length > 0 && completedRequiredItems.length === requiredItems.length) {
        onComplete();
      }
    }
  }, [checklistItems, userProgress, onComplete]);

  // Initialize notes from existing progress
  useEffect(() => {
    if (userProgress) {
      const notesFromProgress: Record<string, string> = {};
      userProgress.forEach(progress => {
        if (progress.notes) {
          notesFromProgress[progress.checklist_item_id] = progress.notes;
        }
      });
      setNotes(notesFromProgress);
    }
  }, [userProgress]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!checklistItems || checklistItems.length === 0) {
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

  const completedItems = checklistItems.filter(item => getItemProgress(item.id)?.is_completed);
  const requiredItems = checklistItems.filter(item => item.is_required);
  const completedRequiredItems = requiredItems.filter(item => getItemProgress(item.id)?.is_completed);

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
            style={{ width: `${(completedItems.length / checklistItems.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Itens obrigatórios: {completedRequiredItems.length} de {requiredItems.length}
        </p>
      </Card>

      <div className="space-y-4">
        {checklistItems.map((item) => {
          const progress = getItemProgress(item.id);
          const isCompleted = progress?.is_completed || false;
          
          return (
            <Card key={item.id} className={cn(
              "p-4 transition-all duration-300 border-2",
              isCompleted ? "border-primary/40 bg-primary/5" : "border-border"
            )}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => 
                      handleItemToggle(item.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                      {isCompleted && (
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
                    value={notes[item.id] || ''}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    className="min-h-[80px]"
                  />
                  {(notes[item.id] !== (progress?.notes || '')) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveNotes(item.id)}
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

      {requiredItems.length > 0 && completedRequiredItems.length === requiredItems.length && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Todos os itens obrigatórios foram concluídos! Você pode avançar para a próxima etapa.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChecklistTab;