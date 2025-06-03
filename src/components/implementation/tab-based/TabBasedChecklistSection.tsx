
import React, { useState } from "react";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSectionTracking } from "@/hooks/implementation/useSectionTracking";

interface TabBasedChecklistSectionProps {
  onSectionComplete: () => void;
  onValidation: (checkedItems: number, totalItems: number) => { isValid: boolean; message?: string; requirement?: string; };
  isCompleted: boolean;
}

export const TabBasedChecklistSection = ({ onSectionComplete, onValidation, isCompleted }: TabBasedChecklistSectionProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { trackInteraction } = useSectionTracking("checklist");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
    trackInteraction("check");
  };

  const handleSectionComplete = () => {
    // Extrair checklist dos módulos da solução ou usar array vazio
    const checklist = data?.solution?.modules?.flatMap((module: any) => 
      module.content?.blocks?.filter((block: any) => block.type === 'checklist')?.flatMap((block: any) => block.data?.items || [])
    ) || [];
    
    const validation = onValidation(checkedItems.size, checklist.length);
    
    if (validation.isValid) {
      onSectionComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Extrair checklist dos módulos da solução
  const checklist = data?.solution?.modules?.flatMap((module: any) => 
    module.content?.blocks?.filter((block: any) => block.type === 'checklist')?.flatMap((block: any) => block.data?.items || [])
  ) || [];

  if (checklist.length === 0) {
    return (
      <Card className="border-white/10">
        <CardContent className="p-8 text-center">
          <ListChecks className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Nenhum checklist disponível</h3>
          <p className="text-gray-500 mb-4">
            Esta solução não possui uma lista de verificação específica.
          </p>
          <Button 
            onClick={onSectionComplete}
            className="bg-viverblue hover:bg-viverblue-dark"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completionRate = checklist.length > 0 ? (checkedItems.size / checklist.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Lista de Verificação
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Complete os itens da lista para garantir uma implementação bem-sucedida
            </p>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </CardHeader>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progresso</h3>
            <span className="text-sm text-gray-500">
              {checkedItems.size}/{checklist.length} ({Math.round(completionRate)}%)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.map((item: any, index: number) => (
              <div key={item.id || index} className="flex items-start gap-3 p-3 rounded-lg border">
                <Checkbox
                  id={`item-${index}`}
                  checked={checkedItems.has(item.id || `item-${index}`)}
                  onCheckedChange={(checked) => 
                    handleItemCheck(item.id || `item-${index}`, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`item-${index}`}
                    className="font-medium cursor-pointer"
                  >
                    {item.title || item.text}
                  </label>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleSectionComplete}
          disabled={isCompleted}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isCompleted ? "Seção Concluída" : "Marcar como Concluída"}
        </Button>
      </div>
    </div>
  );
};
