
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Save, Loader2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
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
    if (!solutionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("implementation_checkpoints")
        .select("*")
        .eq("solution_id", solutionId as any)
        .order("checkpoint_order");
        
      if (error) throw error;
      
      if (data) {
        setCheckpoints(data as any || []);
      }
    } catch (error: any) {
      console.error("Erro ao carregar checkpoints:", error);
      toast({
        title: "Erro ao carregar checkpoints",
        description: error.message || "Ocorreu um erro ao tentar carregar os checkpoints.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCheckpoint = () => {
    if (!solutionId) return;
    
    const newCheckpoint: Checkpoint = {
      solution_id: solutionId,
      description: "",
      checkpoint_order: checkpoints.length + 1
    };
    
    setCheckpoints([...checkpoints, newCheckpoint]);
  };

  const updateCheckpoint = (index: number, field: keyof Checkpoint, value: string | number) => {
    const updatedCheckpoints = [...checkpoints];
    updatedCheckpoints[index] = {
      ...updatedCheckpoints[index],
      [field]: value
    };
    setCheckpoints(updatedCheckpoints);
  };

  const removeCheckpoint = (index: number) => {
    const updatedCheckpoints = checkpoints.filter((_, i) => i !== index);
    // Reordenar os checkpoints
    const reorderedCheckpoints = updatedCheckpoints.map((checkpoint, i) => ({
      ...checkpoint,
      checkpoint_order: i + 1
    }));
    setCheckpoints(reorderedCheckpoints);
  };

  const moveCheckpoint = (fromIndex: number, toIndex: number) => {
    const updatedCheckpoints = [...checkpoints];
    const [movedItem] = updatedCheckpoints.splice(fromIndex, 1);
    updatedCheckpoints.splice(toIndex, 0, movedItem);
    
    // Reordenar
    const reorderedCheckpoints = updatedCheckpoints.map((checkpoint, i) => ({
      ...checkpoint,
      checkpoint_order: i + 1
    }));
    
    setCheckpoints(reorderedCheckpoints);
  };

  const saveCheckpoints = async () => {
    if (!solutionId) return;
    
    try {
      setSavingCheckpoints(true);
      
      // Primeiro, deletar todos os checkpoints existentes
      const { error: deleteError } = await supabase
        .from("implementation_checkpoints")
        .delete()
        .eq("solution_id", solutionId as any);
        
      if (deleteError) throw deleteError;
      
      // Depois, inserir os novos checkpoints
      if (checkpoints.length > 0) {
        const checkpointsToSave = checkpoints
          .filter(checkpoint => checkpoint.description.trim() !== "")
          .map(checkpoint => ({
            solution_id: solutionId,
            description: checkpoint.description,
            checkpoint_order: checkpoint.checkpoint_order
          }));
          
        if (checkpointsToSave.length > 0) {
          const { error: insertError } = await supabase
            .from("implementation_checkpoints")
            .insert(checkpointsToSave as any);
            
          if (insertError) throw insertError;
        }
      }
      
      onSave();
      
      toast({
        title: "Checkpoints salvos",
        description: "Os checkpoints foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar checkpoints:", error);
      toast({
        title: "Erro ao salvar checkpoints",
        description: error.message || "Ocorreu um erro ao tentar salvar os checkpoints.",
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
      <Card className="border border-[#0ABAB5]/20">
        <CardHeader>
          <CardTitle>Lista de Implementação</CardTitle>
          <CardDescription>
            Crie uma lista de verificação detalhada para guiar o usuário durante a implementação da solução.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-center mt-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Checkpoint {checkpoint.checkpoint_order}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCheckpoint(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={checkpoint.description}
                  onChange={(e) => updateCheckpoint(index, 'description', e.target.value)}
                  placeholder="Descreva o que o usuário deve fazer neste checkpoint..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}
          
          <Button
            onClick={addCheckpoint}
            variant="outline"
            className="w-full border-dashed border-[#0ABAB5] text-[#0ABAB5] hover:bg-[#0ABAB5]/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Checkpoint
          </Button>
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
            Salvar Checkpoints
          </>
        )}
      </Button>
    </div>
  );
};

export default ImplementationChecklist;
