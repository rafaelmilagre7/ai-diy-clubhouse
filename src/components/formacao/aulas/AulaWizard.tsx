import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LearningLesson, LearningModule, supabase } from "@/lib/supabase";
import { Editor } from "@/components/editor/Editor";
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  moduleId: z.string().uuid({
    message: "Por favor, selecione um módulo válido.",
  }),
  content: z.any().optional(),
  estimatedTimeMinutes: z.number().optional().default(0),
  aiAssistantEnabled: z.boolean().default(false),
  aiAssistantPrompt: z.string().optional(),
  published: z.boolean().default(false),
  coverImageUrl: z.string().url("Por favor, insira uma URL válida").optional(),
  orderIndex: z.number().optional().default(0),
  videos: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().url("Por favor, insira uma URL válida").optional(),
      type: z.string().optional(),
      fileName: z.string().optional(),
      filePath: z.string().optional(),
      fileSize: z.number().optional(),
    })
  ).optional().default([])
})

interface AulaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: LearningLesson | null;
  moduleId?: string | null;
  onSuccess?: () => void;
}

interface VideoFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
}

// Estendendo a interface LearningLesson para incluir a propriedade videos
interface ExtendedLearningLesson extends LearningLesson {
  videos?: VideoFormValues[];
}

type FormSchema = z.infer<typeof formSchema>

const AulaWizard: React.FC<AulaWizardProps> = ({ open, onOpenChange, aula, moduleId, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultValues: Partial<FormSchema> = {
    title: aula?.title || "",
    description: aula?.description || "",
    moduleId: aula?.module_id || moduleId || "",
    content: aula?.content || {},
    estimatedTimeMinutes: aula?.estimated_time_minutes || 0,
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantPrompt: aula?.ai_assistant_prompt || "",
    published: aula?.published || false,
    coverImageUrl: aula?.cover_image_url || "",
    orderIndex: aula?.order_index || 0,
    videos: (aula as ExtendedLearningLesson)?.videos || []
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  })

  useEffect(() => {
    form.reset(defaultValues);
  }, [aula, moduleId, form]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('learning_modules')
          .select('*')
          .order('title');

        if (error) {
          console.error("Erro ao buscar módulos:", error);
          toast({
            title: "Erro ao carregar",
            description: "Falha ao carregar a lista de módulos.",
            variant: "destructive",
          });
          return;
        }

        setModules(data || []);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        toast({
          title: "Erro ao carregar",
          description: "Falha ao carregar a lista de módulos.",
          variant: "destructive",
        });
      }
    };

    fetchModules();
  }, []);

  const onSubmit = async (values: FormSchema) => {
    try {
      setIsSaving(true);
      
      const lessonId = aula?.id;
      
      console.log("Dados do formulário:", values);
      console.log("ID da aula:", lessonId);
      console.log("Status de publicação a ser salvo:", values.published);
      
      // Preparar os dados completos da lição
      const completeLessonData: Partial<LearningLesson> = {
        title: values.title,
        description: values.description || null,
        module_id: values.moduleId,
        content: values.content || null,
        estimated_time_minutes: values.estimatedTimeMinutes || 0,
        ai_assistant_enabled: values.aiAssistantEnabled,
        ai_assistant_prompt: values.aiAssistantPrompt || null,
        published: values.published,
        cover_image_url: values.coverImageUrl || null,
        order_index: values.orderIndex || 0
      };
      
      console.log("Dados completos a serem salvos:", completeLessonData);
      console.log("Status de publicação a ser salvo:", completeLessonData.published);
      
      if (lessonId) {
        // Atualizar aula existente - FIX: Separar operação de update e verificação
        console.log("Atualizando aula existente:", lessonId);
        
        // 1. Primeiro fazer a atualização sem retorno de dados
        const { error: updateError } = await supabase
          .from('learning_lessons')
          .update(completeLessonData)
          .eq('id', lessonId);
          
        if (updateError) {
          console.error("Erro ao atualizar aula:", updateError);
          throw updateError;
        }
        
        // 2. Depois buscar os dados atualizados para verificar
        const { data: updatedData, error: fetchError } = await supabase
          .from('learning_lessons')
          .select('*')
          .eq('id', lessonId)
          .single();
          
        if (fetchError) {
          console.error("Erro ao buscar aula atualizada:", fetchError);
          throw fetchError;
        }
        
        console.log("Aula atualizada com sucesso:", updatedData);
        console.log("Status de publicação após atualização:", updatedData.published);
        
        if (updatedData.published !== values.published) {
          console.warn("AVISO: Status de publicação após atualização não corresponde ao esperado!");
          console.log("Tentando atualização específica do status de publicação...");
          
          // Tenta atualizar especificamente o status de publicação para garantir
          const { error: pubUpdateError } = await supabase
            .from('learning_lessons')
            .update({ published: values.published })
            .eq('id', lessonId);
            
          if (pubUpdateError) {
            console.error("Erro na atualização específica do status:", pubUpdateError);
          } else {
            console.log("Status de publicação atualizado com sucesso!");
          }
        }
        
        // Atualizar os vídeos da aula
        await handleSaveVideos(lessonId, values.videos);
        
        toast({
          title: "Aula atualizada",
          description: "A aula foi atualizada com sucesso.",
        });
      } else {
        // Criar nova aula
        console.log("Criando nova aula...");
        
        // Verificar se o bucket de vídeos existe para evitar problemas de upload
        await supabase.storage.createBucket('learning_videos', {
          public: true
        }).then(() => {
          console.log("Bucket learning_videos verificado/criado");
        }).catch((error) => {
          // Ignorar erro se o bucket já existir
          if (error.message.includes('already exists')) {
            console.log("Bucket learning_videos já existe");
          } else {
            console.error("Erro ao criar bucket:", error);
          }
        });
        
        const { data, error } = await supabase
          .from('learning_lessons')
          .insert([completeLessonData])
          .select('*')
          .single();
          
        if (error) {
          console.error("Erro ao criar aula:", error);
          throw error;
        }
        
        console.log("Aula criada com sucesso:", data);
        
        // Verificar se os dados foram realmente persistidos
        const { data: verifyData, error: verifyError } = await supabase
          .from('learning_lessons')
          .select('*')
          .eq('id', data.id)
          .single();
          
        if (verifyError) {
          console.error("Erro ao verificar aula criada:", verifyError);
        } else {
          console.log("Verificação da aula criada:", verifyData);
          console.log("Status de publicação verificado:", verifyData.published);
        }
        
        // Salvar os vídeos da aula
        const newLessonId = data.id;
        await handleSaveVideos(newLessonId, values.videos);
        
        toast({
          title: "Aula criada",
          description: "A aula foi criada com sucesso.",
        });
      }
      
      onSuccess?.();
      form.reset(defaultValues);
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast({
        title: "Erro ao salvar aula",
        description: error.message || "Ocorreu um erro ao tentar salvar a aula.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const handleEditorChange = (value: any) => {
    form.setValue("content", value);
  };

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    form.setValue("videos", newVideos);
  };

  const handleAddVideo = () => {
    const videos = form.getValues().videos || [];
    form.setValue("videos", [...videos, { url: '', type: 'youtube' }]);
  };

  const handleRemoveVideo = (index: number) => {
    const videos = form.getValues().videos || [];
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue("videos", newVideos);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(form.getValues().videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items);
  };

  const handleSaveVideos = async (lessonId: string, videos: VideoFormValues[]) => {
    try {
      console.log("Salvando vídeos para a aula:", lessonId);
      console.log("Vídeos a salvar:", videos);
      
      if (!videos || videos.length === 0) {
        console.log("Nenhum vídeo para salvar.");
        return;
      }
      
      // Para cada vídeo no formulário
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        
        // Se o vídeo não tiver URL, pular
        if (!video.url) {
          console.log("Vídeo sem URL encontrado, pulando...");
          continue;
        }
        
        const videoData = {
          lesson_id: lessonId,
          title: video.title || "Vídeo sem título",
          description: video.description || null,
          url: video.url,
          order_index: i,
          video_type: video.type || "youtube",
          video_file_path: video.filePath || null,
          video_file_name: video.fileName || null,
          file_size_bytes: video.fileSize || null,
          duration_seconds: null,
          thumbnail_url: null
        };
        
        console.log(`Salvando vídeo ${i + 1}:`, videoData);
        
        if (video.id) {
          // Atualizar vídeo existente
          const { error } = await supabase
            .from('learning_lesson_videos')
            .update(videoData)
            .eq('id', video.id);
            
          if (error) {
            console.error(`Erro ao atualizar vídeo ${i + 1}:`, error);
            throw error;
          }
          
          console.log(`Vídeo ${i + 1} atualizado com sucesso.`);
        } else {
          // Criar novo vídeo
          const { error } = await supabase
            .from('learning_lesson_videos')
            .insert([videoData]);
            
          if (error) {
            console.error(`Erro ao criar vídeo ${i + 1}:`, error);
            throw error;
          }
          
          console.log(`Vídeo ${i + 1} criado com sucesso.`);
        }
      }
      
      console.log("Todos os vídeos foram salvos com sucesso.");
      return true;
    } catch (error) {
      console.error("Erro ao salvar vídeos:", error);
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {aula ? "editar a aula." : "criar uma nova aula."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da aula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da aula"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={handleEditorChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimatedTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Tempo estimado em minutos"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem da Aula</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ordem da aula no módulo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem de Capa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL da imagem de capa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="aiAssistantEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Habilitar Assistente de IA</FormLabel>
                      <FormDescription>
                        Permite que o assistente de IA ajude os alunos nesta aula.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.getValues().aiAssistantEnabled && (
              <FormField
                control={form.control}
                name="aiAssistantPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt do Assistente de IA</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Prompt para o assistente de IA"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar Aula</FormLabel>
                    <FormDescription>
                      Define se a aula está visível para os alunos.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Vídeos da Aula</FormLabel>
              <FormDescription>
                Adicione e gerencie os vídeos desta aula.
              </FormDescription>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="videos">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {form.getValues().videos?.map((video, index) => (
                        <Draggable key={index} draggableId={`video-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border rounded-md p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div {...provided.dragHandleProps} className="cursor-grab mr-2">
                                    <GripVertical className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <span>Vídeo {index + 1}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVideo(index)}>
                                  Remover
                                </Button>
                              </div>

                              <VideoUpload
                                value={video.url || ""}
                                videoType={video.type || "youtube"}
                                onChange={(url, type, fileName, filePath, fileSize) => {
                                  handleVideoChange(index, "url", url);
                                  handleVideoChange(index, "type", type);
                                  handleVideoChange(index, "fileName", fileName);
                                  handleVideoChange(index, "filePath", filePath);
                                  handleVideoChange(index, "fileSize", fileSize);
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button type="button" variant="outline" className="mt-4" onClick={handleAddVideo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const onSubmit = async (values: FormSchema) => {
  try {
    setIsSaving(true);
    
    const lessonId = aula?.id;
    
    console.log("Dados do formulário:", values);
    console.log("ID da aula:", lessonId);
    console.log("Status de publicação a ser salvo:", values.published);
    
    // Preparar os dados completos da lição
    const completeLessonData: Partial<LearningLesson> = {
      title: values.title,
      description: values.description || null,
      module_id: values.moduleId,
      content: values.content || null,
      estimated_time_minutes: values.estimatedTimeMinutes || 0,
      ai_assistant_enabled: values.aiAssistantEnabled,
      ai_assistant_prompt: values.aiAssistantPrompt || null,
      published: values.published,
      cover_image_url: values.coverImageUrl || null,
      order_index: values.orderIndex || 0
    };
    
    console.log("Dados completos a serem salvos:", completeLessonData);
    console.log("Status de publicação a ser salvo:", completeLessonData.published);
    
    if (lessonId) {
      // Atualizar aula existente - FIX: Separar operação de update e verificação
      console.log("Atualizando aula existente:", lessonId);
      
      // 1. Primeiro fazer a atualização sem retorno de dados
      const { error: updateError } = await supabase
        .from('learning_lessons')
        .update(completeLessonData)
        .eq('id', lessonId);
        
      if (updateError) {
        console.error("Erro ao atualizar aula:", updateError);
        throw updateError;
      }
      
      // 2. Depois buscar os dados atualizados para verificar
      const { data: updatedData, error: fetchError } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
        
      if (fetchError) {
        console.error("Erro ao buscar aula atualizada:", fetchError);
        throw fetchError;
      }
      
      console.log("Aula atualizada com sucesso:", updatedData);
      console.log("Status de publicação após atualização:", updatedData.published);
      
      if (updatedData.published !== values.published) {
        console.warn("AVISO: Status de publicação após atualização não corresponde ao esperado!");
        console.log("Tentando atualização específica do status de publicação...");
        
        // Tenta atualizar especificamente o status de publicação para garantir
        const { error: pubUpdateError } = await supabase
          .from('learning_lessons')
          .update({ published: values.published })
          .eq('id', lessonId);
          
        if (pubUpdateError) {
          console.error("Erro na atualização específica do status:", pubUpdateError);
        } else {
          console.log("Status de publicação atualizado com sucesso!");
        }
      }
      
      // Atualizar os vídeos da aula
      await handleSaveVideos(lessonId, values.videos);
      
      toast({
        title: "Aula atualizada",
        description: "A aula foi atualizada com sucesso.",
      });
    } else {
      // Criar nova aula
      console.log("Criando nova aula...");
      
      // Verificar se o bucket de vídeos existe para evitar problemas de upload
      await supabase.storage.createBucket('learning_videos', {
        public: true
      }).then(() => {
        console.log("Bucket learning_videos verificado/criado");
      }).catch((error) => {
        // Ignorar erro se o bucket já existir
        if (error.message.includes('already exists')) {
          console.log("Bucket learning_videos já existe");
        } else {
          console.error("Erro ao criar bucket:", error);
        }
      });
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .insert([completeLessonData])
        .select('*')
        .single();
        
      if (error) {
        console.error("Erro ao criar aula:", error);
        throw error;
      }
      
      console.log("Aula criada com sucesso:", data);
      
      // Verificar se os dados foram realmente persistidos
      const { data: verifyData, error: verifyError } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', data.id)
        .single();
        
      if (verifyError) {
        console.error("Erro ao verificar aula criada:", verifyError);
      } else {
        console.log("Verificação da aula criada:", verifyData);
        console.log("Status de publicação verificado:", verifyData.published);
      }
      
      // Salvar os vídeos da aula
      const newLessonId = data.id;
      await handleSaveVideos(newLessonId, values.videos);
      
      toast({
        title: "Aula criada",
        description: "A aula foi criada com sucesso.",
      });
    }
    
    onSuccess?.();
    form.reset(defaultValues);
    onOpenChange(false);
    
  } catch (error: any) {
    console.error("Erro ao salvar aula:", error);
    toast({
      title: "Erro ao salvar aula",
      description: error.message || "Ocorreu um erro ao tentar salvar a aula.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};

interface FormDescriptionProps {
  children?: React.ReactNode;
}

const FormDescription: React.FC<FormDescriptionProps> = ({ children }) => {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  );
};

FormDescription.displayName = "FormDescription";

export default AulaWizard;
