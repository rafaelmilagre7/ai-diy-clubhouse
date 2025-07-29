import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { 
  useUnifiedChecklistTemplate, 
  useCreateUnifiedChecklistTemplate,
  type UnifiedChecklistItem 
} from "@/hooks/useUnifiedChecklists";

interface UnifiedImplementationChecklistProps {
  solutionId: string | null;
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

  // Buscar template existente
  const { data: template, isLoading } = useUnifiedChecklistTemplate(
    solutionId || '', 
    'implementation'
  );
  
  // Mutation para salvar template
  const createTemplateMutation = useCreateUnifiedChecklistTemplate();

  console.log("🔧 UnifiedImplementationChecklist: Renderizando com solutionId:", solutionId);

  // Carregar dados do template quando disponível
  useEffect(() => {
    if (template?.checklist_data?.items) {
      setChecklistItems(template.checklist_data.items);
      console.log("✅ Template carregado:", template.checklist_data.items.length, "itens");
    } else if (!isLoading && !template) {
      // Se não há template, inicializar com array vazio para permitir criação
      console.log("⚠️ Nenhum template encontrado, inicializando vazio");
      setChecklistItems([]);
    }
  }, [template, isLoading]);

  const saveCheckpoints = async () => {
    if (!solutionId || !user) return;

    console.log("💾 Salvando template unificado...");
    
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

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = checklistItems.length > 0 
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Checklist de Implementação (Unificado)</h3>
        <p className="text-sm text-muted-foreground">
          Defina os itens que devem ser verificados durante a implementação desta solução.
          Este sistema unificado substitui as tabelas antigas.
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
            <div className="w-full bg-gray-200 rounded-full h-2">
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
            {checklistItems.map((item) => (
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
          disabled={createTemplateMutation.isPending || saving}
          className="min-w-[120px]"
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