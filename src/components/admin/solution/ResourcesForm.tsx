import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentPreview from './ContentPreview';

// Schema for form validation
const resourcesSchema = z.object({
  overview: z.string().optional(),
  materials: z.string().optional(),
  external_links: z.string().optional(),
  faq: z.string().optional(),
});

type ResourcesFormValues = z.infer<typeof resourcesSchema>;

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const form = useForm<ResourcesFormValues>({
    resolver: zodResolver(resourcesSchema),
    defaultValues: {
      overview: '',
      materials: '',
      external_links: '',
      faq: '',
    },
  });
  
  useEffect(() => {
    if (solutionId) {
      fetchResources();
      fetchModules();
    }
  }, [solutionId]);
  
  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error is expected for new solutions
          console.error('Error fetching resources:', error);
          setError('Erro ao carregar recursos. Tente novamente.');
        }
        return;
      }
      
      if (data) {
        form.reset({
          overview: data.overview || '',
          materials: data.materials || '',
          external_links: data.external_links || '',
          faq: data.faq || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Erro ao carregar recursos. Tente novamente.');
    }
  };
  
  const fetchModules = async () => {
    try {
      if (!solutionId) return;
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('solution_id', solutionId)
        .order('module_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching modules:', error);
        return;
      }
      
      if (data) {
        // Filter out modules with empty content
        const validModules = data.filter(module => {
          if (!module.content) return false;
          
          // Check if content is a string (possible legacy format)
          if (typeof module.content === 'string') {
            try {
              const parsed = JSON.parse(module.content);
              return parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0;
            } catch {
              return false;
            }
          }
          
          // Otherwise check if it's an object with blocks
          return module.content && 
                 typeof module.content === 'object' && 
                 module.content.blocks && 
                 Array.isArray(module.content.blocks) && 
                 module.content.blocks.length > 0;
        });
        
        setModules(validModules);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const onSubmit = async (values: ResourcesFormValues) => {
    if (!solutionId) return;
    
    setIsSaving(true);
    
    try {
      // Check if resources exist for this solution
      const { data: existingData, error: checkError } = await supabase
        .from('solution_resources')
        .select('id')
        .eq('solution_id', solutionId)
        .single();
      
      let result;
      
      if (checkError && checkError.code === 'PGRST116') {
        // Resources don't exist, insert new record
        result = await supabase
          .from('solution_resources')
          .insert({
            solution_id: solutionId,
            overview: values.overview,
            materials: values.materials,
            external_links: values.external_links,
            faq: values.faq,
          });
      } else {
        // Resources exist, update record
        result = await supabase
          .from('solution_resources')
          .update({
            overview: values.overview,
            materials: values.materials,
            external_links: values.external_links,
            faq: values.faq,
            updated_at: new Date().toISOString(),
          })
          .eq('solution_id', solutionId);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Successful save
      onSave();
    } catch (error: any) {
      console.error('Error saving resources:', error);
      setError(`Erro ao salvar recursos: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const previewContent = () => {
    setShowPreview(!showPreview);
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Recursos e Materiais Adicionais</CardTitle>
          <CardDescription>
            Adicione recursos, materiais e links externos para complementar a solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="links">Links Externos</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="overview">
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visão Geral dos Recursos</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva a visão geral dos recursos disponíveis para esta solução..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explique brevemente os recursos disponíveis e como utilizá-los.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="materials">
                  <FormField
                    control={form.control}
                    name="materials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materiais e Recursos</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste os materiais e recursos disponíveis..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Liste todos os materiais, templates e recursos incluídos nesta solução.
                          Use formato JSON para estruturar, exemplo:
                          [{"title":"Template de Email", "description":"Modelo pronto para personalizar", "url":"https://..."}]
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="links">
                  <FormField
                    control={form.control}
                    name="external_links"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Links Externos</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Adicione links externos úteis..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Adicione links para ferramentas, artigos ou recursos externos.
                          Use formato JSON para estruturar, exemplo:
                          [{"title":"OpenAI", "description":"Plataforma de IA", "url":"https://openai.com"}]
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="faq">
                  <FormField
                    control={form.control}
                    name="faq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perguntas Frequentes (FAQ)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Adicione perguntas e respostas frequentes..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Adicione perguntas e respostas que antecipem as dúvidas dos membros.
                          Use formato JSON para estruturar, exemplo:
                          [{"question":"Como integrar com Gmail?", "answer":"Primeiro, acesse..."}]
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="preview">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-4">Pré-visualização dos Recursos</h3>
                    
                    {/* Visão Geral */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-md mb-2">Visão Geral</h4>
                      <div className="prose max-w-none">
                        {form.watch('overview') ? (
                          <ContentPreview content={form.watch('overview')} />
                        ) : (
                          <p className="text-muted-foreground italic">Nenhuma visão geral adicionada.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Materiais */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-md mb-2">Materiais e Recursos</h4>
                      <div className="prose max-w-none">
                        {form.watch('materials') ? (
                          <ContentPreview content={form.watch('materials')} isJson={true} />
                        ) : (
                          <p className="text-muted-foreground italic">Nenhum material adicionado.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Links Externos */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-md mb-2">Links Externos</h4>
                      <div className="prose max-w-none">
                        {form.watch('external_links') ? (
                          <ContentPreview content={form.watch('external_links')} isJson={true} />
                        ) : (
                          <p className="text-muted-foreground italic">Nenhum link externo adicionado.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* FAQ */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-md mb-2">Perguntas Frequentes</h4>
                      <div className="prose max-w-none">
                        {form.watch('faq') ? (
                          <ContentPreview content={form.watch('faq')} isJson={true} />
                        ) : (
                          <p className="text-muted-foreground italic">Nenhuma FAQ adicionada.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={previewContent}
                  >
                    {showPreview ? "Voltar para Edição" : "Pré-visualizar"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || isSaving}
                    className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                  >
                    {saving || isSaving ? "Salvando..." : "Salvar Recursos"}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Revisão da Solução</CardTitle>
          <CardDescription>
            Revise todos os módulos da solução antes de publicar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module, index) => (
                  <Card key={module.id} className="shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0ABAB5] text-white text-xs mr-2">
                          {index + 1}
                        </div>
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {moduleTypeToName(module.type)}
                      </p>
                      <p className="text-xs">
                        {getBlocksCount(module.content)} blocos de conteúdo
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">
                  Nenhum módulo foi configurado para esta solução.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("modules")}
                >
                  Configurar Módulos
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Função auxiliar para converter tipo de módulo para nome legível
const moduleTypeToName = (type: string): string => {
  const types: Record<string, string> = {
    landing: "Landing da Solução",
    overview: "Visão Geral e Case Real",
    preparation: "Preparação Express",
    implementation: "Implementação Passo a Passo",
    verification: "Verificação de Implementação",
    results: "Primeiros Resultados",
    optimization: "Otimização Rápida",
    celebration: "Celebração e Próximos Passos"
  };
  
  return types[type] || type;
};

// Função para contar o número de blocos de conteúdo em um módulo
const getBlocksCount = (content: any): number => {
  if (!content) return 0;
  
  // Se o conteúdo for uma string, tenta fazer o parse para objeto
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parsed.blocks?.length || 0;
    } catch {
      return 0;
    }
  }
  
  // Se o conteúdo já for um objeto
  return content.blocks?.length || 0;
};

export default ResourcesForm;
