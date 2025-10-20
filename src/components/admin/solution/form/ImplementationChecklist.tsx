
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
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
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("🔧 ImplementationChecklist: Renderizando com solutionId:", solutionId);

  useEffect(() => {
    if (solutionId && user) {
      fetchCheckpoints();
    } else {
      setLoading(false);
    }
  }, [solutionId, user]);

  const fetchCheckpoints = async () => {
    if (!solutionId || !user) return;

    try {
      setLoading(true);
      console.log("📋 Buscando checkpoints para solução:", solutionId);

      // Como admin, buscar template para esta solução
      const { data, error } = await supabase
        .from("implementation_checkpoints")
        .select("*")
        .eq("solution_id", solutionId)
        .eq("is_template", true)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar checkpoints:", error);
        // Se não existe registro, inicializar com lista vazia
        if (error.code === "PGRST116") {
          setChecklistItems([]);
        } else {
          throw error;
        }
      } else if (data && data.checkpoint_data) {
        // Extrair items do campo JSONB checkpoint_data
        const items = data.checkpoint_data.items || [];
        setChecklistItems(items);
        console.log("✅ Checkpoints carregados:", items.length);
      } else {
        setChecklistItems([]);
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar checkpoints:", error);
      toast({
        title: "Erro ao carregar checklist",
        description: "Não foi possível carregar os itens do checklist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCheckpoints = async () => {
    if (!solutionId || !user) return;

    try {
      setSavingChecklist(true);
      console.log("💾 Salvando checkpoints...");

      const checkpointData = {
        items: checklistItems,
        lastUpdated: new Date().toISOString()
      };

      const completedSteps = checklistItems
        .map((item, index) => item.completed ? String(index) : null)
        .filter(Boolean);

      const progressPercentage = checklistItems.length > 0 
        ? Math.round((completedSteps.length / checklistItems.length) * 100)
        : 0;

      // Verificar se já existe um template para esta solução
      const { data: existingData } = await supabase
        .from("implementation_checkpoints")
        .select("id")
        .eq("solution_id", solutionId)
        .eq("is_template", true)
        .maybeSingle();

      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from("implementation_checkpoints")
          .update({
            checkpoint_data: checkpointData,
            completed_steps: completedSteps,
            total_steps: checklistItems.length,
            progress_percentage: progressPercentage,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        // Criar novo template
        const { error } = await supabase
          .from("implementation_checkpoints")
          .insert({
            solution_id: solutionId,
            user_id: user.id,
            checkpoint_data: checkpointData,
            completed_steps: completedSteps,
            total_steps: checklistItems.length,
            progress_percentage: progressPercentage,
            is_template: true
          });

        if (error) throw error;
      }

      console.log("✅ Checkpoints salvos com sucesso");
      toast({
        title: "Checklist salvo",
        description: "Os itens do checklist foram salvos com sucesso.",
      });

      // Chamar callback de salvamento
      onSave();
    } catch (error: any) {
      console.error("❌ Erro ao salvar checkpoints:", error);
      toast({
        title: "Erro ao salvar checklist",
        description: error.message || "Ocorreu um erro ao tentar salvar o checklist.",
        variant: "destructive",
      });
    } finally {
      setSavingChecklist(false);
    }
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: "",
      description: "",
      completed: false
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id: string, field: keyof ChecklistItem, value: any) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(items => items.filter(item => item.id !== id));
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = checklistItems.length > 0 
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Checklist de Implementação</h3>
        <p className="text-sm text-muted-foreground">
          Defina os itens que devem ser verificados durante a implementação desta solução.
        </p>
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
          disabled={savingChecklist || saving}
          className="min-w-button"
        >
          {savingChecklist ? (
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

export default ImplementationChecklist;
