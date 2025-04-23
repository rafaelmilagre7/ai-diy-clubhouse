
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { CheckSquare, Save } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

interface SolutionChecklistTabProps {
  solution: any;
}

interface CheckpointItem {
  id: string;
  description: string;
  checkpoint_order: number;
  checked?: boolean;
}

const SolutionChecklistTab: React.FC<SolutionChecklistTabProps> = ({ solution }) => {
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [userChecklistId, setUserChecklistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { log, logError } = useLogging("SolutionChecklistTab");

  useEffect(() => {
    const fetchCheckpoints = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar itens do checklist
        const { data: checkpointsData, error: checkpointsError } = await supabase
          .from("implementation_checkpoints")
          .select("*")
          .eq("solution_id", solution.id)
          .order("checkpoint_order", { ascending: true });
          
        if (checkpointsError) throw checkpointsError;
        
        if (!checkpointsData || checkpointsData.length === 0) {
          setCheckpoints([]);
          setLoading(false);
          return;
        }

        // Se o usuário estiver logado, buscar os itens já marcados
        if (user) {
          const { data: userChecklist, error: userChecklistError } = await supabase
            .from("user_checklists")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", solution.id)
            .maybeSingle();
            
          if (userChecklistError) throw userChecklistError;
          
          if (userChecklist) {
            setUserChecklistId(userChecklist.id);
            setCheckedItems(userChecklist.checked_items || {});
            
            // Mapear itens com estado de marcação
            const checkpointsWithChecked = checkpointsData.map(cp => ({
              ...cp,
              checked: !!userChecklist.checked_items?.[cp.id]
            }));
            
            setCheckpoints(checkpointsWithChecked);
          } else {
            // Nenhum checklist do usuário ainda
            setCheckpoints(checkpointsData);
          }
        } else {
          // Usuário não logado
          setCheckpoints(checkpointsData);
        }
      } catch (error) {
        logError("Erro ao carregar checklist", { error });
        toast({
          title: "Erro ao carregar checklist",
          description: "Não foi possível carregar os itens do checklist.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckpoints();
  }, [solution?.id, user, toast, log, logError]);

  // Alternar estado de marcação
  const toggleCheckpoint = (checkpointId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para marcar itens no checklist.",
        variant: "destructive"
      });
      return;
    }
    
    setCheckedItems(prev => ({
      ...prev,
      [checkpointId]: !prev[checkpointId]
    }));
  };

  // Salvar estado do checklist
  const saveChecklistState = async () => {
    if (!user || !solution?.id) return;
    
    try {
      setSaving(true);
      
      if (userChecklistId) {
        // Atualizar checklist existente
        const { error } = await supabase
          .from("user_checklists")
          .update({
            checked_items: checkedItems,
            updated_at: new Date().toISOString()
          })
          .eq("id", userChecklistId);
          
        if (error) throw error;
      } else {
        // Criar novo checklist
        const { data, error } = await supabase
          .from("user_checklists")
          .insert({
            user_id: user.id,
            solution_id: solution.id,
            checked_items: checkedItems,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setUserChecklistId(data[0].id);
        }
      }
      
      // Atualizar estado local com a marcação
      setCheckpoints(prev => 
        prev.map(cp => ({
          ...cp,
          checked: !!checkedItems[cp.id]
        }))
      );
      
      toast({
        title: "Checklist salvo",
        description: "Seu progresso foi salvo com sucesso."
      });
    } catch (error) {
      logError("Erro ao salvar checklist", { error });
      toast({
        title: "Erro ao salvar checklist",
        description: "Não foi possível salvar o progresso do checklist.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = () => {
    return checkpoints.some(cp => !!checkedItems[cp.id] !== cp.checked);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum item de checklist disponível para esta solução.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {checkpoints.map((checkpoint, index) => (
          <div 
            key={checkpoint.id}
            className="flex items-start p-4 border rounded-md hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={`checkpoint-${checkpoint.id}`}
              checked={!!checkedItems[checkpoint.id]}
              onCheckedChange={() => toggleCheckpoint(checkpoint.id)}
              disabled={!user}
              className="mr-3 mt-1"
            />
            <Label 
              htmlFor={`checkpoint-${checkpoint.id}`}
              className={`flex-grow ${checkedItems[checkpoint.id] ? 'line-through text-muted-foreground' : ''}`}
            >
              {checkpoint.description}
            </Label>
          </div>
        ))}
      </div>
      
      {user && hasUnsavedChanges() && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveChecklistState}
            disabled={saving}
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Progresso
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolutionChecklistTab;
