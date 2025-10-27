import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, CheckCircle, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  useUnifiedChecklistTemplate, 
  useCreateUnifiedChecklistTemplate,
  type UnifiedChecklistItem 
} from "@/hooks/useUnifiedChecklists";

interface UnifiedImplementationChecklistProps {
  solutionId: string;
  onSave: () => void;
  saving: boolean;
}

const UnifiedImplementationChecklist: React.FC<UnifiedImplementationChecklistProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const [checklistItems, setChecklistItems] = useState<UnifiedChecklistItem[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: template, isLoading, error, refetch } = useUnifiedChecklistTemplate(
    solutionId,
    'implementation'
  );
  
  const createTemplateMutation = useCreateUnifiedChecklistTemplate();

  useEffect(() => {
    if (isLoading) return;
    
    if (error || !template) {
      setChecklistItems([]);
      return;
    }

    const items = template.checklist_data?.items;
    
    if (!Array.isArray(items) || items.length === 0) {
      setChecklistItems([]);
      return;
    }

    setChecklistItems(items);
  }, [template, isLoading, error]);

  const handleForceReload = async () => {
    await queryClient.invalidateQueries({ 
      queryKey: ['unified-checklist-template']
    });
    
    const result = await refetch();
    
    if (result.data) {
      toast.success('Checklist recarregado!');
    } else {
      toast.error('Não foi possível recarregar');
    }
  };

  const handleDirectFetch = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .eq('is_template', true)
        .maybeSingle();

      if (data) {
        const items = data.checklist_data?.items || [];
        setChecklistItems(items);
        toast.success(`Carregado diretamente: ${items.length} itens!`);
      } else if (error) {
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.error('Nenhum dado encontrado');
      }
    } catch (err) {
      toast.error('Erro na busca direta');
    }
  };

  const saveCheckpoints = async () => {
    if (!user) return;
    
    createTemplateMutation.mutate(
      {
        solutionId,
        checklistData: {
          items: checklistItems,
          metadata: {
            version: "1.0",
            createdBy: user.id,
            lastModified: new Date().toISOString()
          }
        },
        checklistType: 'implementation'
      },
      {
        onSuccess: () => {
          onSave();
        }
      }
    );
  };

  const addChecklistItem = () => {
    const newItem: UnifiedChecklistItem = {
      id: `item-${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      title: "",
      description: "",
      completed: false
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id: string, field: keyof UnifiedChecklistItem, value: any) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(items => items.filter(item => item.id !== id));
  };

  const moveItemUp = (id: string) => {
    setChecklistItems(items => {
      const currentIndex = items.findIndex(item => item.id === id);
      if (currentIndex > 0) {
        const newItems = [...items];
        [newItems[currentIndex - 1], newItems[currentIndex]] = [newItems[currentIndex], newItems[currentIndex - 1]];
        return newItems;
      }
      return items;
    });
  };

  const moveItemDown = (id: string) => {
    setChecklistItems(items => {
      const currentIndex = items.findIndex(item => item.id === id);
      if (currentIndex < items.length - 1) {
        const newItems = [...items];
        [newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]];
        return newItems;
      }
      return items;
    });
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = checklistItems.length > 0 
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="font-medium">Carregando checklist...</p>
                <p className="text-sm text-muted-foreground">ID: {solutionId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-destructive">
              <p className="font-medium">Erro ao carregar checklist</p>
              <p className="text-sm">{error.message}</p>
              <p className="text-xs text-muted-foreground">ID: {solutionId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Checklist de Implementação (Unificado)</h3>
          <p className="text-sm text-muted-foreground">
            Defina os itens que devem ser verificados durante a implementação desta solução.
            Este sistema unificado substitui as tabelas antigas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceReload}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDirectFetch}
            className="gap-2"
          >
            🔧 Debug: Buscar Direto
          </Button>
        </div>
      </div>

      {checklistItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Progresso do Checklist</CardTitle>
              <Badge variant="outline">
                {completedCount}/{checklistItems.length} concluídos
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {checklistItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center pt-2">
                    <Button
                      variant={item.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateChecklistItem(item.id, "completed", !item.completed)}
                      className="h-6 w-6 p-0"
                    >
                      {item.completed && <CheckCircle className="h-3 w-3" />}
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Título do item..."
                      value={item.title}
                      onChange={(e) => updateChecklistItem(item.id, "title", e.target.value)}
                      className={item.completed ? "line-through opacity-60" : ""}
                    />
                    
                    <Textarea
                      placeholder="Descrição do item (opcional)..."
                      value={item.description || ""}
                      onChange={(e) => updateChecklistItem(item.id, "description", e.target.value)}
                      rows={2}
                      className={item.completed ? "line-through opacity-60" : ""}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItemUp(item.id)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                      title="Mover para cima"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItemDown(item.id)}
                      disabled={index === checklistItems.length - 1}
                      className="h-8 w-8 p-0"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(item.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      title="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addChecklistItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveCheckpoints}
          disabled={createTemplateMutation.isPending || saving}
          className="min-w-button"
        >
          {createTemplateMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Salvando...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Checklist
            </>
          )}
        </Button>
      </div>

      {checklistItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhum item no checklist</p>
          <p className="text-sm">
            Adicione itens para criar um checklist de implementação para esta solução.
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedImplementationChecklist;