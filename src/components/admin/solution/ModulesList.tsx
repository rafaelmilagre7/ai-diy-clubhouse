
import React from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit2, Eye, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moduleTypes } from "./moduleTypes";
import { ModuleContent, safeJsonParseObject } from "@/lib/supabase/types";

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
    let hasContent = false;
    try {
      const content = safeJsonParseObject(module.content, { blocks: [] }) as ModuleContent;
      hasContent = content && content.blocks && content.blocks.length > 0;
    } catch (error) {
      hasContent = false;
    }
    
    if (!hasContent) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };
  
  // Função para obter a descrição do tipo de módulo
  const getModuleTypeDescription = (type: string) => {
    const moduleType = moduleTypes.find(m => m.type === type);
    return moduleType?.description || "";
  };

  const getBlockCount = (module: Module): number => {
    try {
      const content = safeJsonParseObject(module.content, { blocks: [] }) as ModuleContent;
      return content?.blocks?.length || 0;
    } catch (error) {
      return 0;
    }
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
        <div className="animate-spin h-8 w-8 border-4 border-[#0ABAB5] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[500px] pr-4">
      <div className="space-y-3">
        {moduleTypes.map((type) => {
          const existingModule = modules.find(m => m.type === type.type);
          const moduleIndex = existingModule ? modules.findIndex(m => m.type === type.type) : -1;
          
          return (
            <Card 
              key={type.type}
              className={`transition-all ${
                existingModule ? "hover:border-[#0ABAB5]/60" : "opacity-60 hover:opacity-100"
              }`}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {existingModule ? getModuleStatusIcon(existingModule) : <AlertCircle className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{existingModule?.title || type.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        Módulo {type.order + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getModuleTypeDescription(type.type)}
                    </p>
                    {existingModule && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {getBlockCount(existingModule)} blocos de conteúdo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={existingModule ? "default" : "outline"}
                  onClick={() => onEditModule(moduleIndex)}
                  className={existingModule ? "bg-[#0ABAB5] hover:bg-[#0ABAB5]/90" : ""}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {existingModule ? "Editar" : "Criar"}
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
