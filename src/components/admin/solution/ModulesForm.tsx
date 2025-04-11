
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, Play, Save, PenTool, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ModuleEditor from "./ModuleEditor";

interface ModulesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ModulesForm = ({ solutionId, onSave, saving }: ModulesFormProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Module types with their display names and descriptions
  const moduleTypes = [
    {
      type: "landing",
      title: "Landing",
      description: "Apresentação inicial (30s)",
      order: 0
    },
    {
      type: "overview",
      title: "Visão Geral",
      description: "Contexto e case (2 min)",
      order: 1
    },
    {
      type: "preparation",
      title: "Preparação",
      description: "Requisitos e setup (3-5 min)",
      order: 2
    },
    {
      type: "implementation",
      title: "Implementação",
      description: "Passo a passo (15-30 min)",
      order: 3
    },
    {
      type: "verification",
      title: "Verificação",
      description: "Testes de funcionamento (2-5 min)",
      order: 4
    },
    {
      type: "results",
      title: "Resultados",
      description: "Primeiros resultados (5 min)",
      order: 5
    },
    {
      type: "optimization",
      title: "Otimização",
      description: "Melhorias e ajustes (5 min)",
      order: 6
    },
    {
      type: "celebration",
      title: "Celebração",
      description: "Conquista e próximos passos (1 min)",
      order: 7
    }
  ];

  // Fetch modules when solutionId changes
  useEffect(() => {
    if (solutionId) {
      fetchModules();
    }
  }, [solutionId]);

  // Function to fetch modules from Supabase
  const fetchModules = async () => {
    if (!solutionId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("solution_id", solutionId)
        .order("module_order", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setModules(data as Module[]);
      } else {
        // If no modules exist, we'll create the default structure
        await createDefaultModules();
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Erro ao carregar módulos",
        description: "Não foi possível carregar os módulos desta solução.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create default modules structure
  const createDefaultModules = async () => {
    if (!solutionId) return;
    
    try {
      const defaultModules = moduleTypes.map(moduleType => ({
        solution_id: solutionId,
        title: moduleType.title,
        type: moduleType.type,
        module_order: moduleType.order,
        content: {
          blocks: []
        }
      }));
      
      const { data, error } = await supabase
        .from("modules")
        .insert(defaultModules)
        .select();
      
      if (error) {
        throw error;
      }
      
      setModules(data as Module[]);
      toast({
        title: "Módulos criados",
        description: "A estrutura básica de módulos foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Error creating default modules:", error);
      toast({
        title: "Erro ao criar módulos",
        description: "Não foi possível criar a estrutura básica de módulos.",
        variant: "destructive",
      });
    }
  };

  // Select a module to edit
  const handleEditModule = (index: number) => {
    setSelectedModuleIndex(index);
    setIsEditing(true);
  };

  // Preview implementation
  const handlePreviewImplementation = () => {
    if (solutionId) {
      navigate(`/implement/${solutionId}/0`);
    }
  };

  // Go back to module list
  const handleBackToList = () => {
    setSelectedModuleIndex(null);
    setIsEditing(false);
  };

  // Handle module save
  const handleModuleSave = async (updatedModule: Module) => {
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: updatedModule.title,
          content: updatedModule.content
        })
        .eq("id", updatedModule.id);
      
      if (error) {
        throw error;
      }
      
      // Update the local modules list
      setModules(prevModules => 
        prevModules.map(module => 
          module.id === updatedModule.id ? updatedModule : module
        )
      );
      
      toast({
        title: "Módulo atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditing(false);
      setSelectedModuleIndex(null);
    } catch (error) {
      console.error("Error saving module:", error);
      toast({
        title: "Erro ao salvar módulo",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  // Navigate to next or previous module
  const handleNavigateModule = (direction: 'next' | 'prev') => {
    if (selectedModuleIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(selectedModuleIndex + 1, modules.length - 1)
      : Math.max(selectedModuleIndex - 1, 0);
    
    setSelectedModuleIndex(newIndex);
  };

  // Render module list or editor
  if (isEditing && selectedModuleIndex !== null && modules.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para lista de módulos
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleNavigateModule('prev')}
              disabled={selectedModuleIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Badge variant="outline" className="px-3 py-1">
              Módulo {selectedModuleIndex + 1} de {modules.length}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => handleNavigateModule('next')}
              disabled={selectedModuleIndex === modules.length - 1}
            >
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ModuleEditor 
          module={modules[selectedModuleIndex]} 
          onSave={handleModuleSave} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Módulos da Solução</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados.
            </p>
            <div className="mt-6">
              {solutionId ? (
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
                              onClick={() => handleEditModule(index)}
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
                      onClick={() => handleEditModule(0)}
                      disabled={isLoading || modules.length === 0}
                    >
                      <PenTool className="mr-2 h-4 w-4" />
                      Editar Módulos
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handlePreviewImplementation}
                      disabled={isLoading || modules.length === 0}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Pré-visualizar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                  <p className="text-sm">
                    Você precisa salvar a solução primeiro para configurar os módulos.
                  </p>
                  <Button 
                    type="button"
                    onClick={onSave}
                    className="mt-4"
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Solução
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesForm;
