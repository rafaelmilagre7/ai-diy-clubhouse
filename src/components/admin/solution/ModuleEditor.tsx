
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Module } from "@/lib/supabase";
import { Save, Eye, Image, FileText, Video, List, ListOrdered, Link as LinkIcon, Bold, Italic, Type, Youtube, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ModuleEditorProps {
  module: Module;
  onSave: (updatedModule: Module) => void;
}

const ModuleEditor = ({ module, onSave }: ModuleEditorProps) => {
  const [editedModule, setEditedModule] = useState<Module>({ ...module });
  const [activeTab, setActiveTab] = useState("editor");
  const [title, setTitle] = useState(module.title);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  // Update local state when module prop changes
  useEffect(() => {
    setEditedModule({ ...module });
    setTitle(module.title);
  }, [module]);

  // Initialize content if it doesn't exist or has an unexpected format
  useEffect(() => {
    if (!editedModule.content || !Array.isArray(editedModule.content.blocks)) {
      setEditedModule(prev => ({
        ...prev,
        content: {
          blocks: []
        }
      }));
    }
  }, []);

  // Helper to get content blocks or return an empty array
  const getContentBlocks = () => {
    return editedModule.content?.blocks || [];
  };

  // Add a new block to the content
  const addBlock = (type: string) => {
    const newBlock = createEmptyBlock(type);
    const updatedBlocks = [...getContentBlocks(), newBlock];
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Create an empty block of the specified type
  const createEmptyBlock = (type: string) => {
    const baseBlock = {
      id: Date.now().toString(),
      type,
    };

    switch (type) {
      case 'header':
        return {
          ...baseBlock,
          data: { text: 'Título', level: 2 }
        };
      case 'paragraph':
        return {
          ...baseBlock,
          data: { text: 'Digite seu texto aqui...' }
        };
      case 'image':
        return {
          ...baseBlock,
          data: { url: '', caption: '', alt: '' }
        };
      case 'list':
        return {
          ...baseBlock,
          data: { items: ['Item 1', 'Item 2'] }
        };
      case 'video':
        return {
          ...baseBlock,
          data: { url: '', caption: '' }
        };
      case 'code':
        return {
          ...baseBlock,
          data: { code: '', language: 'javascript' }
        };
      case 'quote':
        return {
          ...baseBlock,
          data: { text: 'Citação...', caption: 'Autor' }
        };
      case 'youtube':
        return {
          ...baseBlock,
          data: { youtubeId: '', caption: '' }
        };
      default:
        return {
          ...baseBlock,
          data: { text: '' }
        };
    }
  };

  // Update a block at specific index
  const updateBlock = (index: number, data: any) => {
    const blocks = getContentBlocks();
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      data: {
        ...updatedBlocks[index].data,
        ...data
      }
    };

    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Remove a block at specific index
  const removeBlock = (index: number) => {
    const blocks = getContentBlocks();
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    
    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Move a block up or down
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = getContentBlocks();
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[newIndex];
    updatedBlocks[newIndex] = temp;

    setEditedModule(prev => ({
      ...prev,
      content: {
        ...prev.content,
        blocks: updatedBlocks
      }
    }));
  };

  // Save the module
  const handleSave = () => {
    // Validate fields
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "O módulo precisa ter um título.",
        variant: "destructive",
      });
      return;
    }

    const updatedModule = {
      ...editedModule,
      title,
    };

    onSave(updatedModule);
  };

  // Render block editor based on type
  const renderBlockEditor = (block: any, index: number) => {
    const { type, data } = block;

    switch (type) {
      case 'header':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={data.level}
                onChange={(e) => updateBlock(index, { level: parseInt(e.target.value) })}
              >
                <option value="1">H1</option>
                <option value="2">H2</option>
                <option value="3">H3</option>
                <option value="4">H4</option>
              </select>
              <Input
                value={data.text}
                onChange={(e) => updateBlock(index, { text: e.target.value })}
                placeholder="Título"
              />
            </div>
          </div>
        );
      
      case 'paragraph':
        return (
          <Textarea
            value={data.text}
            onChange={(e) => updateBlock(index, { text: e.target.value })}
            placeholder="Digite seu texto aqui..."
            className="min-h-[100px]"
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              value={data.url}
              onChange={(e) => updateBlock(index, { url: e.target.value })}
              placeholder="URL da imagem"
            />
            <Input
              value={data.caption || ''}
              onChange={(e) => updateBlock(index, { caption: e.target.value })}
              placeholder="Legenda (opcional)"
            />
            <Input
              value={data.alt || ''}
              onChange={(e) => updateBlock(index, { alt: e.target.value })}
              placeholder="Texto alternativo para acessibilidade"
            />
            {data.url && (
              <div className="mt-2 border rounded p-2">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <img 
                  src={data.url} 
                  alt={data.alt || 'Preview'} 
                  className="max-h-[200px] object-contain mx-auto"
                />
              </div>
            )}
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-2">
            {data.items.map((item: string, itemIndex: number) => (
              <div key={itemIndex} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const updatedItems = [...data.items];
                    updatedItems[itemIndex] = e.target.value;
                    updateBlock(index, { items: updatedItems });
                  }}
                  placeholder={`Item ${itemIndex + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const updatedItems = data.items.filter((_: any, i: number) => i !== itemIndex);
                    updateBlock(index, { items: updatedItems });
                  }}
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updatedItems = [...data.items, `Item ${data.items.length + 1}`];
                updateBlock(index, { items: updatedItems });
              }}
            >
              + Adicionar Item
            </Button>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-2">
            <Input
              value={data.url}
              onChange={(e) => updateBlock(index, { url: e.target.value })}
              placeholder="URL do vídeo (MP4)"
            />
            <Input
              value={data.caption || ''}
              onChange={(e) => updateBlock(index, { caption: e.target.value })}
              placeholder="Legenda (opcional)"
            />
            {data.url && (
              <div className="mt-2 border rounded p-2">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <video 
                  src={data.url} 
                  controls 
                  className="max-h-[200px] w-full"
                />
              </div>
            )}
          </div>
        );
      
      case 'youtube':
        return (
          <div className="space-y-2">
            <Input
              value={data.youtubeId}
              onChange={(e) => updateBlock(index, { youtubeId: e.target.value })}
              placeholder="ID do vídeo do YouTube (ex: dQw4w9WgXcQ)"
            />
            <Input
              value={data.caption || ''}
              onChange={(e) => updateBlock(index, { caption: e.target.value })}
              placeholder="Legenda (opcional)"
            />
            {data.youtubeId && (
              <div className="mt-2 border rounded p-2">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    src={`https://www.youtube.com/embed/${data.youtubeId}`}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      case 'code':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={data.language}
                onChange={(e) => updateBlock(index, { language: e.target.value })}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <Textarea
              value={data.code}
              onChange={(e) => updateBlock(index, { code: e.target.value })}
              placeholder="Código aqui..."
              className="font-mono text-sm min-h-[150px]"
            />
          </div>
        );
      
      case 'quote':
        return (
          <div className="space-y-2">
            <Textarea
              value={data.text}
              onChange={(e) => updateBlock(index, { text: e.target.value })}
              placeholder="Citação..."
              className="min-h-[100px]"
            />
            <Input
              value={data.caption || ''}
              onChange={(e) => updateBlock(index, { caption: e.target.value })}
              placeholder="Autor ou fonte"
            />
          </div>
        );
      
      default:
        return (
          <div className="bg-muted p-4 rounded">
            Tipo de bloco desconhecido: {type}
          </div>
        );
    }
  };

  // Render block preview based on type
  const renderBlockPreview = (block: any) => {
    const { type, data } = block;

    switch (type) {
      case 'header':
        return React.createElement(
          `h${data.level}`,
          { className: "mt-6 mb-2 font-bold" },
          data.text
        );
      
      case 'paragraph':
        return <p className="my-4">{data.text}</p>;
      
      case 'image':
        return (
          <figure className="my-4">
            <img
              src={data.url}
              alt={data.alt || data.caption || 'Imagem'}
              className="rounded mx-auto max-w-full"
            />
            {data.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {data.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'list':
        return (
          <ul className="list-disc pl-6 my-4 space-y-1">
            {data.items.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      
      case 'video':
        return (
          <figure className="my-4">
            <video
              src={data.url}
              controls
              className="rounded mx-auto max-w-full"
            />
            {data.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {data.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'youtube':
        return (
          <figure className="my-4">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${data.youtubeId}`}
                className="absolute top-0 left-0 w-full h-full rounded"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {data.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {data.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'code':
        return (
          <div className="my-4">
            <div className="bg-muted px-2 py-1 text-xs rounded-t border border-border">
              {data.language}
            </div>
            <pre className="bg-card border border-t-0 border-border p-4 rounded-b overflow-x-auto">
              <code>{data.code}</code>
            </pre>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-viverblue pl-4 my-4 italic">
            <p>{data.text}</p>
            {data.caption && (
              <footer className="text-right text-sm text-muted-foreground mt-2">
                — {data.caption}
              </footer>
            )}
          </blockquote>
        );
      
      default:
        return <div>Tipo de bloco desconhecido: {type}</div>;
    }
  };

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
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('header')}
                >
                  <Type className="h-4 w-4 mr-1" />
                  Título
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('paragraph')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Parágrafo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('image')}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Imagem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Lista
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('video')}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Vídeo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('youtube')}
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  YouTube
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('code')}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Código
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('quote')}
                >
                  <Quote className="h-4 w-4 mr-1" />
                  Citação
                </Button>
              </div>
              
              {getContentBlocks().length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Adicione blocos para começar a criar seu conteúdo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getContentBlocks().map((block: any, index: number) => (
                    <Collapsible key={block.id} className="border rounded-md">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent">
                          <div className="flex items-center">
                            {getBlockIcon(block.type)}
                            <span className="ml-2 capitalize">{block.type}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t">
                          {renderBlockEditor(block, index)}
                          
                          <div className="flex justify-between mt-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === getContentBlocks().length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBlock(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
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
                  {getContentBlocks().map((block: any) => (
                    <div key={block.id}>
                      {renderBlockPreview(block)}
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
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Módulo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper function to get icon for block type
const getBlockIcon = (type: string) => {
  switch (type) {
    case 'header':
      return <Type className="h-4 w-4" />;
    case 'paragraph':
      return <FileText className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'list':
      return <List className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    case 'quote':
      return <Quote className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Additional components
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ChevronUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const Code = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const Quote = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

export default ModuleEditor;
