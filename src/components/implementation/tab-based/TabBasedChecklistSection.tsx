
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CheckSquare, Square, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TabBasedChecklistSectionProps {
  onSectionComplete: () => void;
  isCompleted: boolean;
}

const defaultChecklistItems = [
  {
    id: 1,
    title: "Ferramentas configuradas",
    description: "Todas as ferramentas necessárias foram configuradas e testadas",
    category: "Preparação"
  },
  {
    id: 2,
    title: "Materiais revisados",
    description: "Documentos e materiais de apoio foram baixados e revisados",
    category: "Preparação"
  },
  {
    id: 3,
    title: "Vídeos assistidos",
    description: "Vídeo-aulas foram assistidas e compreendidas",
    category: "Aprendizado"
  },
  {
    id: 4,
    title: "Ambiente de teste preparado",
    description: "Ambiente seguro para testes foi configurado",
    category: "Implementação"
  },
  {
    id: 5,
    title: "Backup realizado",
    description: "Backup dos dados importantes foi realizado antes da implementação",
    category: "Segurança"
  },
  {
    id: 6,
    title: "Implementação executada",
    description: "A solução foi implementada seguindo os passos recomendados",
    category: "Implementação"
  },
  {
    id: 7,
    title: "Testes realizados",
    description: "Testes foram executados para validar o funcionamento",
    category: "Validação"
  },
  {
    id: 8,
    title: "Documentação atualizada",
    description: "Documentação interna foi atualizada com as mudanças",
    category: "Finalização"
  }
];

export const TabBasedChecklistSection = ({ onSectionComplete, isCompleted }: TabBasedChecklistSectionProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (itemId: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const completedCount = checkedItems.size;
  const totalCount = defaultChecklistItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const categories = [...new Set(defaultChecklistItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Checklist de Implementação
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Siga esta lista para garantir uma implementação completa e segura
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="font-semibold">{completedCount}</span>
              <span className="text-gray-500">/{totalCount}</span>
            </div>
            <div className="text-sm font-semibold text-viverblue">
              {completionPercentage}%
            </div>
            {isCompleted && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category} className="border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{category}</h3>
                <Badge variant="outline">
                  {defaultChecklistItems.filter(item => 
                    item.category === category && checkedItems.has(item.id)
                  ).length}/{defaultChecklistItems.filter(item => item.category === category).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {defaultChecklistItems
                  .filter(item => item.category === category)
                  .map((item) => {
                    const isChecked = checkedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                            : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${isChecked ? 'text-green-800 dark:text-green-200' : ''}`}>
                            {item.title}
                          </h4>
                          <p className={`text-sm mt-1 ${isChecked ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onSectionComplete}
          disabled={isCompleted || completedCount < totalCount}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isCompleted ? "Implementação Concluída" : 
           completedCount < totalCount ? `Complete o checklist (${completedCount}/${totalCount})` : 
           "Finalizar Implementação"}
        </Button>
      </div>
    </div>
  );
};
