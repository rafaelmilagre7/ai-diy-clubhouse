
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Module } from "@/lib/supabase";
import { Save, Eye, PenTool, AlertCircle } from "lucide-react";
import BlockToolbar from "./editor/BlockToolbar";
import BlockEditor from "./editor/BlockEditor";
import BlockPreview from "./editor/preview/BlockPreview";
import { useModuleEditor } from "./editor/useModuleEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateModule } from "./editor/utils/moduleValidation";

interface ModuleEditorProps {
  module: Module;
  onSave: (updatedModule: Module) => void;
}

const ModuleEditor = ({ module, onSave }: ModuleEditorProps) => {
  const {
    title,
    setTitle,
    activeTab,
    setActiveTab,
    getContentBlocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    handleSave
  } = useModuleEditor(module);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Função para salvar com validação
  const saveWithValidation = () => {
    // Validar o módulo
    const validation = validateModule(module.type, { blocks: getContentBlocks() });
    
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }
    
    setValidationError(null);
    handleSave(onSave);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do módulo"
                className="text-xl font-bold"
              />
              <div className="bg-muted rounded px-3 py-1 text-sm">
                Tipo: {getModuleTypeName(module.type)}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de validação</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-6">
              <BlockToolbar onAddBlock={addBlock} />
              
              {getContentBlocks().length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Adicione blocos para começar a criar seu conteúdo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getContentBlocks().map((block, index) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
                      index={index}
                      onUpdate={updateBlock}
                      onRemove={removeBlock}
                      onMove={moveBlock}
                      isFirst={index === 0}
                      isLast={index === getContentBlocks().length - 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preview">
              {getContentBlocks().length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Sem conteúdo para pré-visualizar
                  </p>
                </div>
              ) : (
                <div className="prose max-w-full">
                  <h1 className="text-2xl font-bold mb-6">{title}</h1>
                  {getContentBlocks().map((block) => (
                    <div key={block.id}>
                      <BlockPreview block={block} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
          >
            {activeTab === 'editor' ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Pré-visualizar
              </>
            ) : (
              <>
                <PenTool className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
          </Button>
          <Button onClick={saveWithValidation}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Módulo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Função auxiliar para converter o tipo do módulo para um nome legível
const getModuleTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    landing: "Landing da Solução",
    overview: "Visão Geral e Case Real",
    preparation: "Preparação Express",
    implementation: "Implementação Passo a Passo",
    verification: "Verificação de Implementação",
    results: "Primeiros Resultados",
    optimization: "Otimização Rápida",
    celebration: "Celebração e Próximos Passos"
  };
  
  return typeMap[type] || type;
};

export default ModuleEditor;
