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
import { VideoFormValues } from "@/lib/supabase/types";

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

type FormSchema = z.infer<typeof formSchema>

const AulaWizard: React.FC<AulaWizardProps> = ({ open, onOpenChange, aula, moduleId, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const { toast: hookToast } = useToast();

  // Carregamos os vídeos da aula para o estado local
  const [aulaVideos, setAulaVideos] = useState<VideoFormValues[]>([]);
  
  useEffect(() => {
    // Se tiver aula e ID, buscar vídeos
    if (aula?.id) {
      const fetchVideos = async () => {
        try {
          const { data, error } = await supabase
            .from("learning_lesson_videos")
            .select("*")
            .eq("lesson_id", aula.id)
            .order("order_index", { ascending: true });
            
          if (error) throw error;
          
          if (data) {
            const formattedVideos: VideoFormValues[] = data.map(video => ({
              id: video.id,
              title: video.title,
              description: video.description || "",
              url: video.url,
              type: video.video_type || "youtube",
              fileName: video.video_file_name || undefined,
              filePath: video.video_file_path || undefined,
              fileSize: video.file_size_bytes || undefined,
              duration_seconds: video.duration_seconds || undefined,
              thumbnail_url: video.thumbnail_url || undefined,
              video_id: video.video_id || undefined
            }));
            
            setAulaVideos(formattedVideos);
          }
        } catch (error) {
          console.error("Erro ao buscar vídeos da aula:", error);
        }
      };
      
      fetchVideos();
    }
  }, [aula?.id]);

  const defaultValues: Partial<FormSchema> = {
    title: aula?.title || "",
    description: aula?.description || "",
    moduleId: aula?.module_id || moduleId || "",
    coverImageUrl: aula?.cover_image_url || "",
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantPrompt: aula?.ai_assistant_prompt || "",
    published: aula?.published || false,
    orderIndex: aula?.order_index || 0,
    videos: aulaVideos || []
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });

  // Redefinir o formulário quando a aula ou os vídeos mudarem
  useEffect(() => {
    if (aula || aulaVideos.length > 0) {
      form.reset({
        ...defaultValues,
        videos: aulaVideos
      });
    }
  }, [aula, moduleId, aulaVideos, form]);

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
      
      // Primeiro, remover todos os vídeos existentes
      if (aula?.id) {
        const { error: deleteError } = await supabase
          .from('learning_lesson_videos')
          .delete()
          .eq('lesson_id', lessonId);
        
        if (deleteError) {
          console.error("Erro ao remover vídeos existentes:", deleteError);
        }
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
        
        // Inserir novo vídeo
        const { error } = await supabase
          .from('learning_lesson_videos')
          .insert([videoData]);
          
        if (error) {
          console.error(`Erro ao criar vídeo ${i + 1}:`, error);
        } else {
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

  const onSubmit = async (values: FormSchema) => {
    try {
      setIsSaving(true);
      
      const lessonId = aula?.id;
      
      console.log("Dados do formulário:", values);
      console.log("ID da aula:", lessonId);
      console.log("Status de publicação a ser salvo:", values.published);
      
      // Calcular o tempo estimado com base nos vídeos
      const totalDurationMinutes = calculateTotalDuration(values.videos);
      console.log("Tempo total calculado dos vídeos (minutos):", totalDurationMinutes);
      
      // Preparar os dados completos da lição
      const completeLessonData: Partial<LearningLesson> = {
        title: values.title,
        description: values.description || null,
        module_id: values.moduleId,
        cover_image_url: values.coverImageUrl || null,
        estimated_time_minutes: totalDurationMinutes, // Tempo calculado automaticamente
        ai_assistant_enabled: values.aiAssistantEnabled,
        ai_assistant_prompt: values.aiAssistantPrompt || null,
        published: values.published,
        order_index: values.orderIndex || 0
      };
      
      console.log("Dados completos a serem salvos:", completeLessonData);
      console.log("Status de publicação a ser salvo:", completeLessonData.published);
      
      if (lessonId) {
        // Atualizar aula existente
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
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Criar nova aula
        console.log("Criando nova aula...");
        
        // Verificar se o bucket de vídeos existe para evitar problemas de upload
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === 'learning_videos');
          
          if (!bucketExists) {
            console.log("Bucket de vídeos não existe, tentando criar...");
            await supabase.storage.createBucket('learning_videos', {
              public: true,
              fileSizeLimit: 104857600, // 100MB
            });
            console.log("Bucket de vídeos criado com sucesso!");
          }
        } catch (err) {
          console.log("Erro ao verificar/criar bucket:", err);
          // Continuamos mesmo em caso de erro, pois o bucket pode existir
        }
        
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
        
        toast.success("Aula criada com sucesso!");
      }
      
      if (onSuccess) onSuccess();
      form.reset(defaultValues);
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast.error(`Erro ao salvar aula: ${error.message || "Ocorreu um erro ao tentar salvar."}`);
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
              
              {/* Temporariamente desabilitar DragDropContext para prevenir loops */}
              <div className="space-y-4">
                {form.getValues().videos?.map((video, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
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
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

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
