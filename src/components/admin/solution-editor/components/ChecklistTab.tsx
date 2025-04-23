
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  CheckSquare, 
  Plus, 
  Loader2, 
  GripVertical,
  X,
  AlertCircle,
  Save
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ChecklistTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

interface CheckpointItem {
  id: string;
  description: string;
  checkpoint_order: number;
  is_new?: boolean;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving: solutionSaving
}) => {
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState("");
  const { toast } = useToast();

  // Carregar checkpoints da solução
  useEffect(() => {
    const fetchCheckpoints = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("implementation_checkpoints")
          .select("*")
          .eq("solution_id", solution.id)
          .order("checkpoint_order", { ascending: true });
          
        if (error) throw error;
        
        setCheckpoints(data || []);
      } catch (error) {
        console.error("Erro ao carregar checkpoints:", error);
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
  }, [solution?.id, toast]);

  // Adicionar novo checkpoint
  const handleAddCheckpoint = () => {
    if (!newCheckpoint.trim()) return;
    
    const newItem: CheckpointItem = {
      id: `new-${Date.now()}`,
      description: newCheckpoint.trim(),
      checkpoint_order: checkpoints.length,
      is_new: true
    };
    
    setCheckpoints([...checkpoints, newItem]);
    setNewCheckpoint("");
  };

  // Remover checkpoint
  const handleRemoveCheckpoint = (index: number) => {
    setCheckpoints(prev => prev.filter((_, i) => i !== index));
  };

  // Atualizar descrição do checkpoint
  const handleUpdateCheckpoint = (index: number, description: string) => {
    setCheckpoints(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, description } : item
      )
    );
  };

  // Reordenar checkpoints usando drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = [...checkpoints];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Atualizar ordem
    const updatedItems = items.map((item, index) => ({
      ...item,
      checkpoint_order: index
    }));
    
    setCheckpoints(updatedItems);
  };

  // Salvar checkpoints
  const saveCheckpoints = async () => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar itens ao checklist.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Dividir em itens existentes e novos
      const existingItems = checkpoints.filter(item => !item.is_new);
      const newItems = checkpoints.filter(item => item.is_new);
      
      // Remover todos os checkpoints existentes
      if (existingItems.length > 0) {
        await supabase
          .from("implementation_checkpoints")
          .delete()
          .eq("solution_id", solution.id);
      }
      
      // Adicionar todos os checkpoints
      if (checkpoints.length > 0) {
        const itemsToInsert = checkpoints.map((item, index) => ({
          solution_id: solution.id,
          description: item.description,
          checkpoint_order: index,
          ...(item.is_new ? {} : { id: item.id })
        }));
        
        const { error } = await supabase
          .from("implementation_checkpoints")
          .insert(itemsToInsert);
          
        if (error) throw error;
      }
      
      toast({
        title: "Checklist salvo",
        description: "Os itens do checklist foram salvos com sucesso."
      });
      
      // Recarregar os checkpoints para obter os IDs corretos
      const { data: updatedData } = await supabase
        .from("implementation_checkpoints")
        .select("*")
        .eq("solution_id", solution.id)
        .order("checkpoint_order", { ascending: true });
        
      if (updatedData) {
        setCheckpoints(updatedData);
      }
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      toast({
        title: "Erro ao salvar checklist",
        description: "Ocorreu um erro ao tentar salvar os itens do checklist.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">
                Checklist de implementação
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Adicione itens ao checklist para guiar os usuários durante a implementação
              </CardDescription>
            </div>
            <Button 
              onClick={saveCheckpoints} 
              disabled={saving || solutionSaving || !solution?.id}
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Checklist
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!solution?.id && (
            <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar itens ao checklist.
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checkpoints">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {checkpoints.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-md">
                          <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Nenhum item adicionado ao checklist
                          </p>
                        </div>
                      )}
                      
                      {checkpoints.map((checkpoint, index) => (
                        <Draggable 
                          key={checkpoint.id} 
                          draggableId={checkpoint.id.toString()} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center space-x-2 p-3 border rounded-md bg-background"
                            >
                              <div 
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 text-muted-foreground cursor-grab"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <Input
                                  value={checkpoint.description}
                                  onChange={(e) => handleUpdateCheckpoint(index, e.target.value)}
                                  placeholder="Descrição do item"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCheckpoint(index)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="pt-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-grow">
                    <Label htmlFor="new-checkpoint" className="sr-only">
                      Novo item
                    </Label>
                    <Input
                      id="new-checkpoint"
                      placeholder="Adicionar novo item ao checklist..."
                      value={newCheckpoint}
                      onChange={(e) => setNewCheckpoint(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddCheckpoint()}
                    />
                  </div>
                  <Button 
                    onClick={handleAddCheckpoint}
                    disabled={!newCheckpoint.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Adicionar</span>
                  </Button>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={saveCheckpoints} 
                    disabled={saving || solutionSaving || !solution?.id}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Checklist
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistTab;
