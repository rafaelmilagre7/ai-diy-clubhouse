
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ModuleContentChecklistProps {
  module: Module;
}

// Helper function to safely parse checklist from content
const parseChecklist = (content: any): any[] => {
  if (!content) return [];
  
  // If content is an object with checklist property
  if (typeof content === 'object' && content.checklist) {
    return Array.isArray(content.checklist) ? content.checklist : [];
  }
  
  // If content is a string, try to parse it
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.checklist && Array.isArray(parsed.checklist)) {
        return parsed.checklist;
      }
    } catch {
      return [];
    }
  }
  
  return [];
};

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const checklist = parseChecklist(module.content);
  const [checked, setChecked] = useState<string[]>([]);

  const handleCheck = (id: string) => {
    setChecked(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (!checklist.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Sem itens de verificação</h3>
        <p className="text-muted-foreground max-w-md">
          Esta solução não possui uma lista de verificação definida.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de Verificação</h3>
        <p className="text-muted-foreground">
          Use esta lista para verificar se você implementou todos os passos necessários.
        </p>
      </div>

      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <CardTitle>Antes de continuar, verifique:</CardTitle>
          <CardDescription>
            Marque os itens conforme você os completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.map((item: any, index: number) => (
              <div 
                key={item.id || index}
                className="flex gap-3 items-start p-3 rounded-md transition-colors border border-transparent hover:bg-muted/50"
              >
                <Checkbox 
                  id={`checklist-${index}`}
                  checked={checked.includes(item.id || `item-${index}`)}
                  onCheckedChange={() => handleCheck(item.id || `item-${index}`)}
                  className="mt-1"
                />
                <div>
                  <label 
                    htmlFor={`checklist-${index}`} 
                    className={`font-medium ${checked.includes(item.id || `item-${index}`) ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {item.title}
                  </label>
                  {item.description && (
                    <p className={`text-sm text-muted-foreground mt-1 ${checked.includes(item.id || `item-${index}`) ? 'line-through' : ''}`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
