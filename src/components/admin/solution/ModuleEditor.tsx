
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Module } from "@/lib/supabase";
import { Save, Eye, PenTool } from "lucide-react";
import BlockToolbar from "./editor/BlockToolbar";
import BlockEditor from "./editor/BlockEditor";
import BlockPreview from "./editor/preview/BlockPreview";
import { useModuleEditor } from "./editor/useModuleEditor";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do módulo"
              className="text-xl font-bold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <Button onClick={() => handleSave(onSave)}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Módulo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ModuleEditor;
