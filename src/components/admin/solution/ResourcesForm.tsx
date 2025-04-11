
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ContentPreview from "./ContentPreview";
import { 
  FileText, 
  Download, 
  Upload, 
  Link, 
  HelpCircle, 
  Save,
  Loader2,
  PlusCircle,
  Trash2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Definição do schema para validação do formulário
const resourceFormSchema = z.object({
  overview: z.string().optional(),
  materials: z.string().optional(),
  external_links: z.string().optional(),
  faq: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

// Templates para os diferentes tipos de recursos
const TEMPLATES = {
  materials: `[
  {
    "title": "Guia de Implementação",
    "description": "Guia completo em PDF para a implementação da solução.",
    "url": "https://example.com/guia.pdf",
    "type": "pdf"
  },
  {
    "title": "Template de Planilha",
    "description": "Modelo de planilha para acompanhamento da solução.",
    "url": "https://example.com/template.xlsx",
    "type": "spreadsheet"
  }
]`,

  external_links: `[
  {
    "title": "Documentação Oficial",
    "description": "Link para a documentação oficial da ferramenta.",
    "url": "https://example.com/docs"
  },
  {
    "title": "Comunidade de Suporte",
    "description": "Fórum da comunidade para tirar dúvidas.",
    "url": "https://example.com/forum"
  }
]`,

  faq: `[
  {
    "question": "Quanto tempo leva para ver resultados?",
    "answer": "Você deve começar a ver os primeiros resultados em cerca de 2 semanas após a implementação completa."
  },
  {
    "question": "É necessário conhecimento técnico?",
    "answer": "Não é necessário conhecimento técnico avançado, mas familiaridade básica com as ferramentas mencionadas é recomendada."
  }
]`
};

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

interface ModuleContent {
  blocks?: any[];
  [key: string]: any;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      overview: '',
      materials: TEMPLATES.materials,
      external_links: TEMPLATES.external_links,
      faq: TEMPLATES.faq
    }
  });
  
  // Carregar recursos existentes
  useEffect(() => {
    const fetchResources = async () => {
      if (!solutionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('solution_resources')
          .select('*')
          .eq('solution_id', solutionId)
          .eq('type', 'resources')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          try {
            // Parse the URL field as it contains our JSON data
            const resourceData = JSON.parse(data.url);
            form.reset({
              overview: resourceData.overview || '',
              materials: resourceData.materials ? JSON.stringify(resourceData.materials, null, 2) : TEMPLATES.materials,
              external_links: resourceData.external_links ? JSON.stringify(resourceData.external_links, null, 2) : TEMPLATES.external_links,
              faq: resourceData.faq ? JSON.stringify(resourceData.faq, null, 2) : TEMPLATES.faq
            });
          } catch (parseError) {
            console.error('Error parsing resource data:', parseError);
            form.reset({
              overview: '',
              materials: TEMPLATES.materials,
              external_links: TEMPLATES.external_links,
              faq: TEMPLATES.faq
            });
          }
        }
      } catch (fetchError) {
        console.error('Error fetching resources:', fetchError);
        setError('Erro ao carregar recursos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch módulos para o resumo de conteúdo
    const fetchModules = async () => {
      if (!solutionId) return;
      
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('solution_id', solutionId)
          .order('module_order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Filter modules with valid content structure
        const validModules = data.filter(module => {
          if (!module.content) return false;
          
          try {
            // Safely parse content regardless of its current format
            let parsedContent: ModuleContent;
            
            if (typeof module.content === 'string') {
              parsedContent = JSON.parse(module.content);
            } else {
              parsedContent = module.content as ModuleContent;
            }
            
            // Check if it has blocks array and it's not empty
            return parsedContent && 
                  Array.isArray(parsedContent.blocks) && 
                  parsedContent.blocks.length > 0;
          } catch (e) {
            console.error('Error parsing module content:', e);
            return false;
          }
        });
        
        setModules(validModules);
      } catch (fetchError) {
        console.error('Error fetching modules:', fetchError);
      }
    };
    
    fetchResources();
    fetchModules();
  }, [solutionId, form]);
  
  // Função para salvar todos os recursos
  const handleSaveResources = async () => {
    if (!solutionId) {
      toast({
        title: "Salve a solução primeiro",
        description: "Você precisa salvar as informações básicas antes de adicionar recursos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const values = form.getValues();
      
      // Parse JSON fields
      let resourcesData: any = { overview: values.overview };
      
      try {
        if (values.materials) {
          resourcesData.materials = JSON.parse(values.materials);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar materiais. Verifique o formato JSON.');
      }
      
      try {
        if (values.external_links) {
          resourcesData.external_links = JSON.parse(values.external_links);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar links externos. Verifique o formato JSON.');
      }
      
      try {
        if (values.faq) {
          resourcesData.faq = JSON.parse(values.faq);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar FAQ. Verifique o formato JSON.');
      }
      
      // Check if resource already exists
      const { data: existingResource, error: queryError } = await supabase
        .from('solution_resources')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('type', 'resources')
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }
      
      if (existingResource) {
        // Update existing resource
        const { error: updateError } = await supabase
          .from('solution_resources')
          .update({
            url: JSON.stringify(resourcesData),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new resource
        const { error: insertError } = await supabase
          .from('solution_resources')
          .insert({
            solution_id: solutionId,
            type: 'resources',
            name: 'Solution Resources',
            url: JSON.stringify(resourcesData),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos da solução foram salvos com sucesso.",
      });
      
      // Call parent save callback
      onSave();
    } catch (saveError: any) {
      console.error('Error saving resources:', saveError);
      setError(saveError.message || 'Erro ao salvar recursos. Por favor, tente novamente.');
      toast({
        title: "Erro ao salvar recursos",
        description: saveError.message || "Ocorreu um erro ao tentar salvar os recursos da solução.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addResourceSection = () => {
    const currentValues = form.getValues()[activeTab as keyof ResourceFormValues] as string || '';
    let newItem = '';
    
    switch(activeTab) {
      case 'materials':
        newItem = ',\n  {\n    "title": "Novo Material",\n    "description": "Descrição do novo material",\n    "url": "https://example.com/novo-material",\n    "type": "pdf"\n  }';
        break;
      case 'external_links':
        newItem = ',\n  {\n    "title": "Novo Link",\n    "description": "Descrição do novo link",\n    "url": "https://example.com/novo-link"\n  }';
        break;
      case 'faq':
        newItem = ',\n  {\n    "question": "Nova Pergunta",\n    "answer": "Resposta para a nova pergunta"\n  }';
        break;
      default:
        return;
    }
    
    try {
      // Add new item to existing JSON array
      let jsonArray = JSON.parse(currentValues);
      if (Array.isArray(jsonArray)) {
        const updatedContent = currentValues.trim();
        const newContent = updatedContent.endsWith(']') 
          ? updatedContent.substring(0, updatedContent.length - 1) + newItem + '\n]'
          : updatedContent;
        
        form.setValue(activeTab as any, newContent);
      }
    } catch (error) {
      console.error('Error adding resource section:', error);
      // If parsing fails, just append as string
      const baseTemplate = TEMPLATES[activeTab as keyof typeof TEMPLATES] || '[]';
      form.setValue(activeTab as any, baseTemplate);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Carregando recursos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recursos da Solução</CardTitle>
          <CardDescription>
            Gerencie os recursos, materiais de apoio e FAQs relacionados a esta solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Materiais
              </TabsTrigger>
              <TabsTrigger value="external_links" className="flex-1">
                <Link className="h-4 w-4 mr-2" />
                Links Externos
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="overview">Resumo da Solução</Label>
                  <Textarea
                    id="overview"
                    placeholder="Forneça uma visão geral completa desta solução..."
                    rows={15}
                    {...form.register('overview')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Este texto será exibido na página principal da solução, acima dos módulos de implementação.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Pré-visualização</Label>
                  </div>
                  <ContentPreview 
                    content={form.watch('overview')} 
                    isJson={false}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="materials">Materiais de Apoio (JSON)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addResourceSection}
                      type="button"
                      className="h-8 px-2 text-xs"
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Adicionar Item
                    </Button>
                  </div>
                  <Textarea
                    id="materials"
                    placeholder={TEMPLATES.materials}
                    rows={15}
                    {...form.register('materials')}
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Adicione materiais de suporte para esta solução (PDFs, planilhas, slides, etc).</p>
                    <p>Campos necessários: <code>title</code>, <code>description</code>, <code>url</code>, <code>type</code>.</p>
                    <p>Tipos suportados: <code>pdf</code>, <code>spreadsheet</code>, <code>presentation</code>, <code>image</code>, <code>video</code>, <code>document</code>, <code>other</code>.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Pré-visualização</Label>
                  </div>
                  <ContentPreview 
                    content={form.watch('materials')} 
                    isJson={true}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="external_links" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="external_links">Links Externos (JSON)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addResourceSection}
                      type="button"
                      className="h-8 px-2 text-xs"
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Adicionar Link
                    </Button>
                  </div>
                  <Textarea
                    id="external_links"
                    placeholder={TEMPLATES.external_links}
                    rows={15}
                    {...form.register('external_links')}
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Adicione links para recursos externos úteis para esta solução.</p>
                    <p>Campos necessários: <code>title</code>, <code>description</code>, <code>url</code>.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Pré-visualização</Label>
                  </div>
                  <ContentPreview 
                    content={form.watch('external_links')} 
                    isJson={true}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="faq">Perguntas Frequentes (JSON)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={addResourceSection}
                      type="button"
                      className="h-8 px-2 text-xs"
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Adicionar Pergunta
                    </Button>
                  </div>
                  <Textarea
                    id="faq"
                    placeholder={TEMPLATES.faq}
                    rows={15}
                    {...form.register('faq')}
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Adicione perguntas frequentes sobre esta solução.</p>
                    <p>Campos necessários: <code>question</code>, <code>answer</code>.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Pré-visualização</Label>
                  </div>
                  <ContentPreview 
                    content={form.watch('faq')} 
                    isJson={true}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveResources} 
              disabled={isSaving || saving || !solutionId}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              {isSaving || saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Recursos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Conteúdo</CardTitle>
            <CardDescription>
              Visão geral dos módulos de conteúdo existentes nesta solução.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Módulo {index + 1}: {module.title}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {getBlocksCount(module.content)} blocos
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tipo: <span className="capitalize">{module.type}</span>
                    </p>
                    <Separator />
                  </div>
                ))}
                
                {modules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum módulo de conteúdo criado ainda.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getBlocksCount = (content: any): number => {
  try {
    // Handle content whether it's a string or already parsed JSON
    let parsedContent: ModuleContent;
    
    if (typeof content === 'string') {
      parsedContent = JSON.parse(content);
    } else {
      parsedContent = content as ModuleContent;
    }
    
    return parsedContent.blocks?.length || 0;
  } catch (e) {
    console.error('Error parsing content:', e);
    return 0;
  }
};

export default ResourcesForm;
