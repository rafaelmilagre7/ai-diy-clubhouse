
import React from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit2, Eye, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moduleTypes } from "./moduleTypes";

interface ModulesListProps {
  modules: Module[];
  onEditModule: (index: number) => void;
  onPreview: () => void;
  isLoading: boolean;
}

const ModulesList = ({ modules, onEditModule, onPreview, isLoading }: ModulesListProps) => {
  // Função para obter o ícone apropriado com base no status do módulo
  const getModuleStatusIcon = (module: Module) => {
    // Verificar se o módulo tem conteúdo significativo
    const hasContent = module.content?.blocks && module.content.blocks.length > 0;
    
    if (!hasContent) {
      return <XCircle className="h-5 w-5 text-status-error" />;
    }
    
    return <CheckCircle className="h-5 w-5 text-system-healthy" />;
  };
  
  // Função para obter a descrição do tipo de módulo
  const getModuleTypeDescription = (type: string) => {
    const moduleType = moduleTypes.find(m => m.type === type);
    return moduleType?.description || "";
  };

  // Criar um array de todos os tipos de módulos para exibir inclusive os que não existem ainda
  const allModuleTypes = moduleTypes.map(type => {
    const existingModule = modules.find(m => m.type === type.type);
    return {
      id: existingModule?.id || `new-${type.type}`,
      title: existingModule?.title || type.title,
      type: type.type,
      exists: !!existingModule,
      module: existingModule,
      order: type.order
    };
  }).sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-aurora-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-scroll-lg pr-4">
      <div className="space-y-3">
        {allModuleTypes.map((item) => {
          const moduleIndex = item.exists ? modules.findIndex(m => m.type === item.type) : -1;
          
          return (
            <Card 
              key={item.id}
              className={`transition-all ${
                item.exists ? "hover:border-aurora-primary/60" : "opacity-60 hover:opacity-100"
              }`}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.exists ? getModuleStatusIcon(item.module!) : <AlertCircle className="h-5 w-5 text-warning" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        Módulo {item.order + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getModuleTypeDescription(item.type)}
                    </p>
                    {item.module?.content?.blocks && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.module.content.blocks.length} blocos de conteúdo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={item.exists ? "aurora-primary" : "outline"}
                  onClick={() => onEditModule(moduleIndex)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {item.exists ? "Editar" : "Criar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {modules.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onPreview} variant="outline" className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Implementação
          </Button>
        </div>
      )}
    </ScrollArea>
  );
};

export default ModulesList;
