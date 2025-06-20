
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface Checkpoint {
  id?: string;
  solution_id: string;
  description: string;
  checkpoint_order: number;
}

interface ImplementationChecklistProps {
  solutionId: string | null;
}

export const ImplementationChecklist = ({ solutionId }: ImplementationChecklistProps) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState('');
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
        .from('implementation_checkpoints')
        .select('*')
        .eq('solution_id', solutionId as any)
        .order('checkpoint_order');

      if (error) throw error;
      
      setCheckpoints((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar checkpoints:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os checkpoints.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCheckpoint = async () => {
    if (!newCheckpoint.trim() || !solutionId) return;

    try {
      setSaving(true);
      const nextOrder = Math.max(...checkpoints.map(c => c.checkpoint_order), 0) + 1;
      
      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .insert({
          solution_id: solutionId,
          description: newCheckpoint.trim(),
          checkpoint_order: nextOrder
        } as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCheckpoints(prev => [...prev, data as any]);
        setNewCheckpoint('');
        toast({
          title: "Checkpoint adicionado",
          description: "O checkpoint foi adicionado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar checkpoint:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar o checkpoint.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCheckpoint = async (id: string, description: string) => {
    try {
      const { error } = await supabase
        .from('implementation_checkpoints')
        .update({ description } as any)
        .eq('id', id as any);

      if (error) throw error;

      setCheckpoints(prev => 
        prev.map(cp => cp.id === id ? { ...cp, description } : cp)
      );

      toast({
        title: "Checkpoint atualizado",
        description: "O checkpoint foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar checkpoint:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o checkpoint.",
        variant: "destructive",
      });
    }
  };

  const deleteCheckpoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('implementation_checkpoints')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      setCheckpoints(prev => prev.filter(cp => cp.id !== id));
      
      toast({
        title: "Checkpoint removido",
        description: "O checkpoint foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover checkpoint:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover o checkpoint.",
        variant: "destructive",
      });
    }
  };

  const reorderCheckpoints = async (dragIndex: number, hoverIndex: number) => {
    try {
      const newCheckpoints = [...checkpoints];
      const draggedItem = newCheckpoints[dragIndex];
      newCheckpoints.splice(dragIndex, 1);
      newCheckpoints.splice(hoverIndex, 0, draggedItem);
      
      // Atualizar as ordens
      const updatedCheckpoints = newCheckpoints.map((cp, index) => ({
        ...cp,
        checkpoint_order: index + 1
      }));
      
      setCheckpoints(updatedCheckpoints);
      
      // Salvar no banco
      for (const cp of updatedCheckpoints) {
        if (cp.id) {
          await supabase
            .from('implementation_checkpoints')
            .update({ checkpoint_order: cp.checkpoint_order } as any)
            .eq('id', cp.id as any);
        }
      }
    } catch (error) {
      console.error('Erro ao reordenar checkpoints:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar os checkpoints.",
        variant: "destructive",
      });
      // Recarregar em caso de erro
      fetchCheckpoints();
    }
  };

  const saveAllCheckpoints = async () => {
    if (!solutionId) return;
    
    try {
      setSaving(true);
      
      // Primeiro, remover todos os checkpoints existentes
      const { error: deleteError } = await supabase
        .from('implementation_checkpoints')
        .delete()
        .eq('solution_id', solutionId as any);

      if (deleteError) throw deleteError;

      // Depois, inserir todos os checkpoints atuais
      if (checkpoints.length > 0) {
        const checkpointsToInsert = checkpoints.map((cp, index) => ({
          solution_id: solutionId,
          description: cp.description,
          checkpoint_order: index + 1
        }));

        const { error: insertError } = await supabase
          .from('implementation_checkpoints')
          .insert(checkpointsToInsert as any);

        if (insertError) throw insertError;
      }

      toast({
        title: "Checkpoints salvos",
        description: "Todos os checkpoints foram salvos com sucesso.",
      });
      
      // Recarregar para obter os IDs atualizados
      await fetchCheckpoints();
    } catch (error) {
      console.error('Erro ao salvar checkpoints:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar os checkpoints.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!solutionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Salve a solução primeiro para criar checkpoints de implementação.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lista de Implementação
          <Badge variant="outline">
            {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">Carregando checkpoints...</div>
        ) : (
          <>
            <div className="space-y-3">
              {checkpoints.map((checkpoint, index) => (
                <div key={checkpoint.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <span className="text-sm font-medium text-muted-foreground min-w-8">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={checkpoint.description}
                    onChange={(e) => {
                      const newCheckpoints = [...checkpoints];
                      newCheckpoints[index].description = e.target.value;
                      setCheckpoints(newCheckpoints);
                    }}
                    onBlur={(e) => {
                      if (checkpoint.id) {
                        updateCheckpoint(checkpoint.id, e.target.value);
                      }
                    }}
                    className="flex-1 min-h-[60px]"
                    placeholder="Descreva este passo da implementação..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => checkpoint.id && deleteCheckpoint(checkpoint.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Novo checkpoint de implementação..."
                value={newCheckpoint}
                onChange={(e) => setNewCheckpoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCheckpoint()}
                className="flex-1"
              />
              <Button onClick={addCheckpoint} disabled={!newCheckpoint.trim() || saving}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {checkpoints.length > 0 && (
              <div className="flex justify-end pt-4">
                <Button onClick={saveAllCheckpoints} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Todos'}
                </Button>
              </div>
            )}

            {checkpoints.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum checkpoint criado ainda. Adicione checkpoints para guiar a implementação desta solução.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
