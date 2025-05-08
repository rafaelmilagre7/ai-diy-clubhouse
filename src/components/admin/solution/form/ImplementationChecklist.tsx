
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  CheckSquare
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ImplementationCheckpoint } from "@/lib/supabase/types";

interface Checkpoint {
  id?: string;
  solution_id: string;
  description: string;
  checkpoint_order: number;
}

interface ImplementationChecklistProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ImplementationChecklist: React.FC<ImplementationChecklistProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    { solution_id: solutionId || "", description: "", checkpoint_order: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [savingCheckpoints, setSavingCheckpoints] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchCheckpoints();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchCheckpoints = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("implementation_checkpoints")
        .select("*")
        .eq("solution_id", solutionId)
        .order("checkpoint_order", { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convertendo para o tipo Checkpoint
        const checkpointData = data.map((item: ImplementationCheckpoint) => ({
          id: item.id,
          solution_id: item.solution_id || '',
          description: item.description,
          checkpoint_order: item.checkpoint_order
        }));
        
        setCheckpoints(checkpointData);
      } else {
        setCheckpoints([{ 
          solution_id: solutionId || "", 
          description: "", 
          checkpoint_order: 0 
        }]);
      }
    } catch (error) {
      console.error("Erro ao carregar checkpoints:", error);
      toast({
        title: "Erro ao carregar checklist",
        description: "Não foi possível carregar os itens do checklist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheckpoint = () => {
    const nextOrder = checkpoints.length;
    setCheckpoints([
      ...checkpoints, 
      { 
        solution_id: solutionId || "", 
        description: "", 
        checkpoint_order: nextOrder 
      }
    ]);
  };

  const handleRemoveCheckpoint = (index: number) => {
    if (checkpoints.length <= 1) {
      toast({
        title: "Não é possível remover",
        description: "O checklist deve ter pelo menos um item.",
        variant: "destructive",
      });
      return;
    }
    
    const newCheckpoints = [...checkpoints];
    newCheckpoints.splice(index, 1);
    
    // Reordenar os checkpoints
    const reorderedCheckpoints = newCheckpoints.map((checkpoint, i) => ({
      ...checkpoint,
      checkpoint_order: i
    }));
    
    setCheckpoints(reorderedCheckpoints);
  };

  const handleMoveCheckpoint = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === checkpoints.length - 1)
    ) {
      return;
    }
    
    const newCheckpoints = [...checkpoints];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    // Trocar os itens de posição
    [newCheckpoints[index], newCheckpoints[swapIndex]] = 
      [newCheckpoints[swapIndex], newCheckpoints[index]];
    
    // Atualizar as ordens
    const reorderedCheckpoints = newCheckpoints.map((checkpoint, i) => ({
      ...checkpoint,
      checkpoint_order: i
    }));
    
    setCheckpoints(reorderedCheckpoints);
  };

  const handleCheckpointChange = (index: number, value: string) => {
    const newCheckpoints = [...checkpoints];
    newCheckpoints[index] = { 
      ...newCheckpoints[index], 
      description: value 
    };
    setCheckpoints(newCheckpoints);
  };

  const saveCheckpoints = async () => {
    if (!solutionId) return;
    
    try {
      setSavingCheckpoints(true);
      
      // Filtrar checkpoints vazios
      const validCheckpoints = checkpoints.filter(
        checkpoint => checkpoint.description.trim() !== ""
      );
      
      if (validCheckpoints.length === 0) {
        toast({
          title: "Checklist vazio",
          description: "Adicione pelo menos um item ao checklist para continuar.",
          variant: "destructive",
        });
        setSavingCheckpoints(false);
        return;
      }
      
      // Primeiro, excluir todos os checkpoints existentes
      const { error: deleteError } = await supabase
        .from("implementation_checkpoints")
        .delete()
        .eq("solution_id", solutionId);
        
      if (deleteError) throw deleteError;
      
      // Depois, inserir os novos checkpoints
      const checkpointsToInsert = validCheckpoints.map((checkpoint, index) => ({
        solution_id: solutionId,
        description: checkpoint.description,
        checkpoint_order: index
      }));
      
      const { error: insertError } = await supabase
        .from("implementation_checkpoints")
        .insert(checkpointsToInsert);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Checklist salvo",
        description: "Os itens do checklist foram salvos com sucesso.",
      });
      
      // Chamar a função de salvamento da solução
      onSave();
    } catch (error: any) {
      console.error("Erro ao salvar checkpoints:", error);
      toast({
        title: "Erro ao salvar checklist",
        description: error.message || "Ocorreu um erro ao tentar salvar o checklist.",
        variant: "destructive",
      });
    } finally {
      setSavingCheckpoints(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Checklist de Implementação</h3>
        <p className="text-sm text-muted-foreground">
          Adicione itens que o usuário deve verificar para confirmar a correta implementação da solução.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-2 text-muted-foreground">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <Textarea
                    value={checkpoint.description}
                    onChange={(e) => handleCheckpointChange(index, e.target.value)}
                    placeholder={`Item ${index + 1} do checklist. Ex: Verificar se a API está configurada corretamente`}
                    className="flex-1 min-h-[80px]"
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveCheckpoint(index, "up")}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveCheckpoint(index, "down")}
                      disabled={index === checkpoints.length - 1}
                      className="h-8 w-8"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveCheckpoint(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddCheckpoint}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item ao Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveCheckpoints}
        disabled={savingCheckpoints || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingCheckpoints ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ImplementationChecklist;
