
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Eye } from "lucide-react";
import { moduleTypes } from "./moduleTypes";
import { Module } from "@/lib/supabase";

interface ModulesListProps {
  modules: Module[];
  onEditModule: (index: number) => void;
  onPreview: () => void;
  isLoading: boolean;
}

const ModulesList: React.FC<ModulesListProps> = ({
  modules,
  onEditModule,
  onPreview,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cada solução é estruturada em 8 módulos sequenciais:
      </p>
      <ul className="space-y-2 text-left max-w-md mx-auto">
        {moduleTypes.map((moduleType, index) => {
          const moduleExists = modules.some(m => m.type === moduleType.type);
          return (
            <li key={moduleType.type} className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                <span>{moduleType.title} - {moduleType.description}</span>
              </div>
              {moduleExists && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditModule(index)}
                  className="ml-2"
                >
                  <PenTool className="h-4 w-4" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
        <Button 
          type="button" 
          onClick={() => onEditModule(0)}
          disabled={isLoading || modules.length === 0}
        >
          <PenTool className="mr-2 h-4 w-4" />
          Editar Módulos
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={onPreview}
          disabled={isLoading || modules.length === 0}
        >
          <Eye className="mr-2 h-4 w-4" />
          Pré-visualizar
        </Button>
      </div>
    </div>
  );
};

export default ModulesList;
