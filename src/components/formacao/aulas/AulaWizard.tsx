import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
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
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  moduleId: z.string().uuid({
    message: "Por favor, selecione um módulo válido.",
  }),
  coverImageUrl: z.string().optional(),
  aiAssistantEnabled: z.boolean().default(false),
  aiAssistantPrompt: z.string().optional(),
  published: z.boolean().default(false),
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
      duration_seconds: z.number().optional(),
      video_id: z.string().optional(),
      thumbnail_url: z.string().optional(),
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
  duration_seconds?: number;
  video_id?: string;
  thumbnail_url?: string;
}

// Estendendo a interface LearningLesson para incluir a propriedade videos
interface ExtendedLearningLesson extends LearningLesson {
  videos?: VideoFormValues[];
}

type FormSchema = z.infer<typeof formSchema>

const AulaWizard: React.FC<AulaWizardProps> = ({ open, onOpenChange, aula, moduleId, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const { toast: hookToast } = useToast();

  const defaultValues: Partial<FormSchema> = {
    title: aula?.title || "",
    description: aula?.description || "",
    moduleId: aula?.module_id || moduleId || "",
    coverImageUrl: aula?.cover_image_url || "",
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantPrompt: aula?.ai_assistant_prompt || "",
    published: aula?.published || false,
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
          hookToast({
            title: "Erro ao carregar",
            description: "Falha ao carregar a lista de módulos.",
            variant: "destructive",
          });
          return;
        }

        setModules(data || []);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        hookToast({
          title: "Erro ao carregar",
          description: "Falha ao carregar a lista de módulos.",
          variant: "destructive",
        });
      }
    };

    fetchModules();
  }, []);

  const calculateTotalDuration = (videos: VideoFormValues[]): number => {
    if (!videos || videos.length === 0) return 0;
    
    let totalDuration = 0;
    for (const video of videos) {
      if (video.duration_seconds) {
        totalDuration += video.duration_seconds;
      }
    }
    
    // Converter segundos para minutos e arredondar para cima
    return Math.ceil(totalDuration / 60);
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
          video_file_path: video.filePath || video.video_id || null, // Usar video_id como fallback
          video_file_name: video.fileName || null,
          file_size_bytes: video.fileSize || null,
          duration_seconds: video.duration_seconds || null,
          thumbnail_url: video.thumbnail_url || null,
          video_id: video.video_id || null
        };
        
        console.log(`Salvando vídeo ${i + 1}:`, videoData);
        
        if (video.id && video.id.startsWith('temp-video-')) {
          // É um vídeo novo temporário, criar
          const { error } = await supabase
            .from('learning_lesson_videos')
            .insert([videoData]);
            
          if (error) {
            console.error(`Erro ao criar vídeo ${i + 1}:`, error);
            throw error;
          }
          
          console.log(`Vídeo ${i + 1} criado com sucesso.`);
        } else if (video.id) {
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
          // Criar novo vídeo sem id temporário
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
      
      // Remover vídeos que não estão mais presentes
      if (aula?.id) {
        const videoIds = videos
          .filter(v => v.id && !v.id.startsWith('temp-video-'))
          .map(v => v.id);
          
        if (videoIds.length > 0) {
          const { error } = await supabase
            .from('learning_lesson_videos')
            .delete()
            .eq('lesson_id', lessonId)
            .not('id', 'in', `(${videoIds.join(',')})`);
            
          if (error) {
            console.error("Erro ao remover vídeos não utilizados:", error);
          }
        }
      }
      
      console.log("Todos os vídeos foram salvos com sucesso.");
      return true;
    } catch (error) {
      console.error("Erro ao salvar vídeos:", error);
      return false;
    }
  };

  const onSubmit = async (values: FormSchema) => {
    try {
      setIsSaving(true);
      
      const lessonId = aula?.id;
      
      console.log("Dados do formulário:", values);
      console.log("ID da aula:", lessonId);
      console.log("Status de publicação a ser salvo:", values.published);
      
      // Calcular o tempo estimado com base nos vídeos
      const totalDurationMinutes = calculateTotalDuration(values.videos);
      console.log("Tempo total calculado dos vídeos:", totalDurationMinutes);
      
      // Definir dados básicos da aula
      const lessonData = {
        title: values.title,
        description: values.description || null,
        module_id: values.moduleId,
        cover_image_url: values.coverImageUrl || null,
        ai_assistant_enabled: values.aiAssistantEnabled,
        ai_assistant_prompt: values.aiAssistantPrompt || null,
        published: values.published,
        estimated_time_minutes: totalDurationMinutes || 0
      };
      
      let lessonResponse;
      
      if (lessonId) {
        // Atualizar aula existente
        lessonResponse = await supabase
          .from('learning_lessons')
          .update(lessonData)
          .eq('id', lessonId)
          .select()
          .single();
        
        if (lessonResponse.error) {
          throw lessonResponse.error;
        }
        
        console.log("Aula atualizada com sucesso:", lessonResponse.data);
        
        // Salvar vídeos
        await handleSaveVideos(lessonId, values.videos);
      } else {
        // Criar nova aula
        lessonResponse = await supabase
          .from('learning_lessons')
          .insert({
            ...lessonData,
            order_index: values.orderIndex || 0, // Usar o valor do formulário
          })
          .select()
          .single();
        
        if (lessonResponse.error) {
          throw lessonResponse.error;
        }
        
        console.log("Nova aula criada:", lessonResponse.data);
        
        // Salvar vídeos
        await handleSaveVideos(lessonResponse.data.id, values.videos);
      }
      
      // Mostrar mensagem de sucesso
      toast.success({
        description: lessonId ? "A aula foi atualizada com sucesso." : "A aula foi criada com sucesso."
      });
      
      // Fechar o modal e chamar callback de sucesso
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast.error({
        description: error.message || "Ocorreu um erro ao salvar a aula."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 z-10 bg-background pb-4">
          <DialogTitle>{aula ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {aula ? "editar a aula." : "criar uma nova aula."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Título da Aula</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da aula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Descrição da Aula</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da aula"
                        className="min-h-[80px]"
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
                    <FormLabel>3. Imagem da Capa</FormLabel>
                    <FormControl>
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="orderIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Ordem da Aula</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ordem da aula no módulo"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Posição desta aula dentro do módulo
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <FormField
                control={form.control}
                name="aiAssistantEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">5. Assistente de IA</FormLabel>
                      <FormDescription>
                        Ative para permitir assistência de IA nesta aula
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

              {form.getValues().aiAssistantEnabled && (
                <FormField
                  control={form.control}
                  name="aiAssistantPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Assistente de IA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ID do assistente (ex: asst_abc123)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="rounded-lg border p-4">
              <FormLabel className="text-base block mb-4">6. Vídeos da Aula</FormLabel>
              <FormDescription className="mb-4">
                Os vídeos adicionados aqui determinarão automaticamente o tempo total da aula
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
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div {...provided.dragHandleProps} className="cursor-grab mr-2">
                                    <GripVertical className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <span className="font-medium">Vídeo {index + 1}</span>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveVideo(index)}
                                >
                                  Remover
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <Input
                                  placeholder="Título do vídeo"
                                  value={video.title || ''}
                                  onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                                  className="mb-2"
                                />
                                
                                <Textarea
                                  placeholder="Descrição do vídeo"
                                  value={video.description || ''}
                                  onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                                  className="mb-2 resize-none h-20"
                                />
                                
                                <VideoUpload
                                  value={video.url || ""}
                                  videoType={video.type || "youtube"}
                                  onChange={(url, type, fileName, filePath, fileSize, duration_seconds, thumbnail_url) => {
                                    handleVideoChange(index, "url", url);
                                    handleVideoChange(index, "type", type);
                                    handleVideoChange(index, "fileName", fileName);
                                    handleVideoChange(index, "filePath", filePath);
                                    handleVideoChange(index, "fileSize", fileSize);
                                    handleVideoChange(index, "duration_seconds", duration_seconds);
                                    handleVideoChange(index, "thumbnail_url", thumbnail_url);
                                    
                                    // Se for um vídeo do YouTube, tentar extrair duração (implementação futura)
                                    // Por enquanto, adicionamos um valor padrão para teste de 300 segundos (5 min)
                                    // if (type === 'youtube') {
                                    //   handleVideoChange(index, "duration_seconds", 300);
                                    // }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleAddVideo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </div>

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar Aula</FormLabel>
                    <FormDescription>
                      Quando publicada, a aula ficará visível para os alunos.
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

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Aula"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AulaWizard;
