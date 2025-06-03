
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Square } from "lucide-react";
import { Solution } from "@/lib/supabase";

interface TabBasedChecklistSectionProps {
  solutionId: string;
  solution: Solution;
  onSectionComplete?: () => void;
  onValidation?: (checkedItems: number, totalItems: number) => { isValid: boolean; message?: string; requirement?: string; };
  isCompleted?: boolean;
}

export const TabBasedChecklistSection = ({ 
  solutionId, 
  solution, 
  onSectionComplete, 
  onValidation, 
  isCompleted 
}: TabBasedChecklistSectionProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Checklist genérico baseado na solução
  const defaultChecklist = [
    {
      id: 'understand',
      title: 'Compreendi completamente a solução',
      description: 'Li e entendi todos os detalhes da implementação'
    },
    {
      id: 'tools',
      title: 'Tenho acesso às ferramentas necessárias',
      description: 'Confirmei que posso acessar todas as ferramentas listadas'
    },
    {
      id: 'materials',
      title: 'Baixei todos os materiais de apoio',
      description: 'Fiz download dos materiais relevantes para minha implementação'
    },
    {
      id: 'videos',
      title: 'Assisti aos vídeos explicativos',
      description: 'Vi todos os vídeos para entender melhor o processo'
    },
    {
      id: 'planning',
      title: 'Planejei a implementação',
      description: 'Defini quando e como vou implementar esta solução'
    },
    {
      id: 'implementation',
      title: 'Implementei a solução',
      description: 'Coloquei a solução em prática no meu negócio'
    },
    {
      id: 'testing',
      title: 'Testei os resultados',
      description: 'Verifiquei se a solução está funcionando como esperado'
    }
  ];

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    
    // Chamar validação se fornecida
    if (onValidation) {
      onValidation(newCheckedItems.size, defaultChecklist.length);
    }
  };

  const completionPercentage = Math.round((checkedItems.size / defaultChecklist.length) * 100);

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Lista de Verificação
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Marque os itens conforme você os completa ({checkedItems.size}/{defaultChecklist.length} - {completionPercentage}%)
          </p>
        </CardHeader>
      </Card>

      <Card className="border-white/10">
        <CardContent className="p-6 space-y-4">
          {defaultChecklist.map((item) => {
            const isChecked = checkedItems.has(item.id);
            
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <div className="mt-1">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-viverblue" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${isChecked ? 'text-muted-foreground line-through' : ''}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm text-muted-foreground mt-1 ${isChecked ? 'line-through' : ''}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {completionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Checklist Completo!
            </h3>
            <p className="text-green-700">
              Parabéns! Você completou todos os itens da lista de verificação. 
              Agora você pode finalizar a implementação.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
