
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ImplementationChecklistProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

interface ChecklistItem {
  id?: string;
  title: string;
  description: string;
  order?: number;
}

const ImplementationChecklist: React.FC<ImplementationChecklistProps> = ({
  solutionId,
  onSave,
  saving: parentSaving
}) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchChecklistItems();
    }
  }, [solutionId]);

  const fetchChecklistItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('checklist_items')
        .eq('id', solutionId)
        .single();

      if (error) throw error;

      // Verificar se checklist_items existe e é um array
      const items = Array.isArray(data.checklist_items) ? data.checklist_items : [];
      setChecklistItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens do checklist:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do checklist',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setChecklistItems([
      ...checklistItems,
      {
        id: `temp-${Date.now()}`,
        title: '',
        description: '',
        order: checklistItems.length
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...checklistItems];
    newItems.splice(index, 1);
    setChecklistItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof ChecklistItem, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setChecklistItems(newItems);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Filtrar itens vazios
      const validItems = checklistItems.filter(item => item.title);

      // Atualizar os itens de checklist no banco
      const { error } = await supabase
        .from('solutions')
        .update({
          checklist_items: validItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);

      if (error) throw error;

      // Chamar a função de callback
      await onSave();

      toast({
        title: 'Sucesso',
        description: 'Checklist de implementação salvo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o checklist',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando checklist...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Checklist de implementação</h3>
        <p className="text-muted-foreground mt-1">
          Adicione os itens de verificação que o usuário precisa completar para implementar esta solução.
        </p>
      </div>

      {checklistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-md">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum item de checklist adicionado</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleAddItem}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar item de checklist
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {checklistItems.map((item, index) => (
            <div key={item.id || index} className="border rounded-md p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-3">
                    <Label htmlFor={`item-title-${index}`}>Item do checklist</Label>
                    <Input
                      id={`item-title-${index}`}
                      value={item.title}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      placeholder="Ex: Configurar API do OpenAI"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label htmlFor={`item-order-${index}`}>Ordem</Label>
                    <Input
                      id={`item-order-${index}`}
                      type="number"
                      value={item.order !== undefined ? item.order : index}
                      onChange={(e) => handleItemChange(index, 'order', e.target.value)}
                      min={0}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`item-description-${index}`}>Descrição</Label>
                  <Textarea
                    id={`item-description-${index}`}
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Descrição detalhada deste item do checklist"
                    rows={2}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover item
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar item
            </Button>
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || parentSaving}
            >
              Salvar checklist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImplementationChecklist;
