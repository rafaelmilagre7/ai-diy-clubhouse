
import React, { useState, useEffect } from "react";
import { Module } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { CheckSquare, Square, CheckCircle, AlertTriangle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface EnhancedModuleContentChecklistProps {
  module: Module;
}

export const EnhancedModuleContentChecklist = ({ module }: EnhancedModuleContentChecklistProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const checklist = module.content?.checklist || [];

  // Load saved checklist state
  useEffect(() => {
    const loadChecklistState = async () => {
      if (!user || !module.solution_id) return;
      
      try {
        const { data, error } = await supabase
          .from("user_checklists")
          .select("checked_items")
          .eq("user_id", user.id)
          .eq("solution_id", module.solution_id)
          .maybeSingle();
          
        if (error && error.code !== "PGRST116") {
          console.error("Erro ao carregar checklist:", error);
          return;
        }
        
        if (data?.checked_items) {
          setCheckedItems(data.checked_items);
        }
      } catch (error) {
        console.error("Erro ao carregar estado do checklist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChecklistState();
  }, [user, module.solution_id]);

  const handleCheckChange = async (itemId: string, checked: boolean) => {
    // Update local state immediately for responsive UI
    const newCheckedItems = { ...checkedItems, [itemId]: checked };
    setCheckedItems(newCheckedItems);
    
    // Save to database
    if (user && module.solution_id) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("user_checklists")
          .upsert({
            user_id: user.id,
            solution_id: module.solution_id,
            checked_items: newCheckedItems,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,solution_id'
          });
          
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao salvar checklist:", error);
        // Revert local state on error
        setCheckedItems(checkedItems);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o progresso do checklist.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto mb-4"></div>
        <p className="text-neutral-400">Carregando checklist...</p>
      </div>
    );
  }

  if (!checklist || checklist.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">✅</div>
        <h3 className="text-2xl font-semibold text-white mb-3">Nenhuma verificação necessária</h3>
        <p className="text-neutral-400 max-w-md mx-auto">
          Esta solução não possui itens de verificação específicos.
        </p>
      </div>
    );
  }

  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = checklist.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isFullyCompleted = completedItems === totalItems;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-viverblue/20 rounded-full mb-4">
          {isFullyCompleted ? (
            <Trophy className="h-8 w-8 text-yellow-400" />
          ) : (
            <CheckSquare className="h-8 w-8 text-viverblue" />
          )}
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent mb-4">
          {isFullyCompleted ? 'Implementação Concluída!' : 'Lista de Verificação'}
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto mb-6">
          {isFullyCompleted 
            ? 'Parabéns! Você completou todos os itens necessários para a implementação.'
            : 'Verifique cada item abaixo para garantir que sua implementação está completa e funcionando corretamente.'
          }
        </p>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-400">Progresso da Verificação</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-viverblue font-medium">
                {completedItems} de {totalItems}
              </span>
              {isFullyCompleted && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  Completo
                </Badge>
              )}
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {checklist.map((item: any, index: number) => {
          const itemId = item.id || `item-${index}`;
          const isChecked = checkedItems[itemId] || false;
          
          return (
            <div
              key={itemId}
              className={`group relative transition-all duration-300 ${
                isChecked ? 'scale-[0.98] opacity-75' : 'hover:scale-[1.01]'
              }`}
            >
              <div className={`absolute -inset-0.5 rounded-xl blur transition duration-300 ${
                isChecked 
                  ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 opacity-50' 
                  : 'bg-gradient-to-r from-viverblue/20 to-viverblue-dark/20 opacity-0 group-hover:opacity-100'
              }`}></div>
              
              <div className={`relative bg-white/5 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
                isChecked 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-white/10 hover:bg-white/10 hover:border-viverblue/30'
              }`}>
                <div className="flex items-start space-x-4">
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => handleCheckChange(itemId, !isChecked)}
                    disabled={saving}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      isChecked
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-neutral-500 hover:border-viverblue hover:bg-viverblue/10'
                    }`}
                  >
                    {isChecked && <CheckCircle className="h-4 w-4" />}
                  </button>
                  
                  {/* Item Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-medium transition-colors ${
                          isChecked 
                            ? 'text-green-300 line-through' 
                            : 'text-white group-hover:text-viverblue-light'
                        }`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className={`mt-2 text-sm leading-relaxed transition-colors ${
                            isChecked 
                              ? 'text-neutral-500 line-through' 
                              : 'text-neutral-300'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="ml-4">
                        {isChecked ? (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        ) : item.required ? (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Obrigatório
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-neutral-600 text-neutral-400">
                            Opcional
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Actions */}
      {isFullyCompleted && (
        <div className="text-center pt-8 border-t border-white/10">
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-8">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">
              🎉 Implementação Concluída com Sucesso!
            </h3>
            <p className="text-green-300 mb-6 max-w-md mx-auto">
              Você verificou todos os itens necessários. Sua solução está pronta para uso!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Finalizar Implementação
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
