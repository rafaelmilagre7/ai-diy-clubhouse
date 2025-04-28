
import { useState } from "react";
import { Module } from "@/types/learningTypes";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, FileText, Plus, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseModuleTreeProps {
  modules: Module[];
  selectedModuleId: string | null;
  onSelect: (moduleId: string) => void;
  onCreateModule: () => void;
}

export function CourseModuleTree({
  modules,
  selectedModuleId,
  onSelect,
  onCreateModule,
}: CourseModuleTreeProps) {
  // Estado para os módulos expandidos
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Função para alternar a expansão de um módulo
  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };
  
  // Se não houver módulos
  if (!modules.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Este curso ainda não tem módulos.
        </p>
        <Button onClick={onCreateModule}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {modules.map((module) => (
        <div key={module.id}>
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted group",
              selectedModuleId === module.id && "bg-muted"
            )}
            onClick={() => onSelect(module.id)}
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModuleExpansion(module.id);
                }}
              >
                {expandedModules[module.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              <span className="truncate">{module.title}</span>
              
              {!module.published && (
                <Badge variant="outline" className="text-xs">
                  Rascunho
                </Badge>
              )}
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/admin/learning/module/${module.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Módulo
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {expandedModules[module.id] && (
            <div className="ml-6 pl-2 border-l border-muted mt-1">
              {/* Em uma implementação completa, aqui apareceriam as aulas deste módulo */}
              <div className="py-2 text-sm text-muted-foreground">
                <Link 
                  to={`/admin/learning/module/${module.id}`}
                  className="flex items-center py-1 px-2 hover:bg-muted rounded-md"
                >
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Gerenciar Aulas
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
