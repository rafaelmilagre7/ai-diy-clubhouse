
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LearningLesson, LearningLessonVideo } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/formacao/comum/ImageUpload";
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { Loader2, Plus, Trash } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Edit } from "lucide-react";
import { formatDuration } from "@/lib/utils";

const aulaFormSchema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  content: z.any().optional(),
  cover_image_url: z.string().optional().nullable(),
  published: z.boolean().default(false),
  ai_assistant_enabled: z.boolean().default(true),
  ai_assistant_id: z.string().optional(),
  videos: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Título do vídeo é obrigatório"),
    description: z.string().optional(),
    url: z.string().min(1, "URL do vídeo é obrigatória"),
    thumbnail_url: z.string().optional(),
    video_type: z.string().default("youtube"),
    video_file_path: z.string().optional(),
    video_file_name: z.string().optional(),
    file_size_bytes: z.number().optional(),
    duration_seconds: z.number().optional(),
    order_index: z.number().default(0),
  })).default([])
});

type AulaFormValues = z.infer<typeof aulaFormSchema>;

interface AulaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: LearningLesson;
  moduleId: string;
  onSuccess?: () => void;
}

export const AulaWizard = ({ 
  open, 
  onOpenChange,
  aula,
  moduleId,
  onSuccess
}: AulaWizardProps) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("detalhes");
  const { log, logError } = useLogging();
  
  // Configurar formulário
  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: {},
      cover_image_url: "",
      published: false,
      ai_assistant_enabled: true,
      ai_assistant_id: "",
      videos: []
    }
  });
  
  // Função para lidar com mudanças no estado do modal
  const handleOpenChange = (newOpen: boolean) => {
    // Se estiver fechando o modal, resetamos o formulário
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };
  
  // Efeito para resetar e inicializar o formulário quando aula ou estado do modal mudar
  useEffect(() => {
    if (open && aula) {
      console.log("Inicializando formulário com aula existente:", aula);
      // Inicializa o formulário com os valores da aula
      form.reset({
        title: aula.title || "",
        description: aula.description || "",
        content: aula.content || {},
        cover_image_url: aula.cover_image_url || "",
        published: aula.published || false,
        ai_assistant_enabled: aula.ai_assistant_enabled ?? true,
        ai_assistant_id: aula.ai_assistant_prompt || "",
        videos: [] // Será preenchido quando buscarmos os vídeos
      });
      
      // Se a aula tem ID, buscamos os vídeos
      if (aula.id) {
        fetchVideos(aula.id);
      }
    } else if (open) {
      console.log("Inicializando formulário para nova aula");
      // Se está abrindo para criar uma nova aula, resetamos o formulário
      form.reset({
        title: "",
        description: "",
        content: {},
        cover_image_url: "",
        published: false,
        ai_assistant_enabled: true,
        ai_assistant_id: "",
        videos: []
      });
    }
  }, [aula, open, form.reset]);
  
  // Buscar vídeos da aula se estiver editando
  const fetchVideos = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Vídeos carregados:", data);
        form.setValue('videos', data);
      }
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      logError("fetch_videos_error", error);
    }
  };

  // Manipular adição de vídeo
  const handleAddVideo = () => {
    const currentVideos = form.getValues().videos || [];
    form.setValue('videos', [
      ...currentVideos, 
      { 
        title: "", 
        description: "",
        url: "",
        video_type: "youtube",
        order_index: currentVideos.length 
      }
    ]);
  };
  
  // Manipular remoção de vídeo
  const handleRemoveVideo = (index: number) => {
    const currentVideos = form.getValues().videos;
    // Filtrar o video pelo índice e reordenar os índices restantes
    const updatedVideos = currentVideos
      .filter((_, i) => i !== index)
      .map((video, i) => ({ ...video, order_index: i }));
    
    form.setValue('videos', updatedVideos);
  };
  
  // Manipular alteração de vídeo
  const handleVideoChange = (index: number, url: string, videoType: string, fileName?: string, filePath?: string, fileSize?: number) => {
    const currentVideos = form.getValues().videos;
    const videoData = { 
      ...currentVideos[index],
      url,
      video_type: videoType,
      video_file_name: fileName,
      video_file_path: filePath,
      file_size_bytes: fileSize
    };
    
    if (videoType === "youtube") {
      // Extrair ID do vídeo do YouTube para gerar thumbnail
      let videoId = "";
      if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
        videoData.thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      
      // Estimar duração do vídeo para YouTube (momentaneamente definido como 5 minutos até que seja obtido)
      videoData.duration_seconds = videoData.duration_seconds || 300;
    }
    
    const updatedVideos = [...currentVideos];
    updatedVideos[index] = videoData;
    
    console.log("Video alterado:", videoData);
    form.setValue('videos', updatedVideos);
  };

  // Calcular tempo estimado baseado na duração dos vídeos
  const calculateEstimatedTime = (): number => {
    const videos = form.getValues().videos || [];
    let totalSeconds = 0;
    
    videos.forEach(video => {
      if (video.duration_seconds) {
        totalSeconds += video.duration_seconds;
      } else {
        // Se não tiver duração, estimar 5 minutos (300 segundos) por vídeo
        totalSeconds += 300;
      }
    });
    
    // Converter para minutos
    return Math.ceil(totalSeconds / 60);
  };

  const onSubmit = async (values: AulaFormValues) => {
    console.log("Iniciando salvamento da aula com os valores:", values);
    console.log("Estado do formulário:", form.formState);
    console.log("Vídeos para salvar:", values.videos);
    console.log("Campo published:", values.published);
    
    if (!moduleId) {
      toast.error("Módulo não especificado");
      return;
    }
    
    setSaving(true);
    
    try {
      console.log("Salvando aula para o módulo:", moduleId);
      
      // Calcular tempo estimado automaticamente com base nos vídeos
      const estimated_time_minutes = calculateEstimatedTime();
      console.log("Tempo estimado calculado:", estimated_time_minutes, "minutos");
      
      // Preparar dados da aula
      let lessonId = aula?.id;
      
      // Separar os dados de vídeo do objeto de aula
      // Clone os valores para não modificar o objeto original
      const { videos, ...lessonData } = {...values};
      
      // Criar um novo objeto com todas as propriedades e o module_id
      const completeLessonData = {
        ...lessonData,
        module_id: moduleId,
        published: values.published, // Garantir que o estado de publicação seja explicitamente definido
        ai_assistant_prompt: values.ai_assistant_id, // Usar o campo ai_assistant_id como ai_assistant_prompt no banco
        estimated_time_minutes: estimated_time_minutes // Definir tempo estimado calculado
      };
      
      console.log("Dados da aula a serem salvos:", completeLessonData);
      console.log("Status de publicação a ser salvo:", completeLessonData.published);
      
      if (lessonId) {
        // Atualizar aula existente
        console.log("Atualizando aula existente:", lessonId);
        
        const { data, error } = await supabase
          .from('learning_lessons')
          .update(completeLessonData)
          .eq('id', lessonId)
          .select('*');
          
        if (error) {
          console.error("Erro ao atualizar aula:", error);
          throw error;
        }
        
        console.log("Resposta da atualização da aula:", data);
        if (data && data.length > 0) {
          console.log("Status de publicação após atualização:", data[0].published);
          if (data[0].published !== values.published) {
            console.warn("AVISO: Status de publicação não corresponde ao esperado!");
          }
        }
      } else {
        // Criar nova aula
        console.log("Criando nova aula");
        const { data, error } = await supabase
          .from('learning_lessons')
          .insert(completeLessonData)
          .select()
          .single();
          
        if (error) {
          console.error("Erro ao criar aula:", error);
          throw error;
        }
        
        console.log("Nova aula criada:", data);
        lessonId = data.id;
      }
      
      // Em seguida, gerenciar vídeos
      if (lessonId && videos.length > 0) {
        console.log(`Gerenciando ${videos.length} vídeos para a aula ${lessonId}`);
        
        // Primeiro, buscar vídeos existentes para esta aula
        const { data: existingVideos } = await supabase
          .from('learning_lesson_videos')
          .select('id')
          .eq('lesson_id', lessonId);
        
        const existingVideoIds = existingVideos?.map(v => v.id) || [];
        const remainingVideoIds = [...existingVideoIds];
        console.log("IDs de vídeos existentes:", existingVideoIds);
        
        // Para cada vídeo no formulário, inserir ou atualizar
        for (const video of videos) {
          console.log("Processando vídeo:", video);
          
          const videoData = {
            lesson_id: lessonId,
            title: video.title,
            description: video.description || null,
            url: video.url,
            thumbnail_url: video.thumbnail_url || null,
            order_index: video.order_index,
            video_type: video.video_type || 'youtube',
            video_file_path: video.video_file_path || null,
            video_file_name: video.video_file_name || null,
            file_size_bytes: video.file_size_bytes || null,
            duration_seconds: video.duration_seconds || null
          };
          
          if (video.id && existingVideoIds.includes(video.id)) {
            // Atualizar vídeo existente
            console.log("Atualizando vídeo existente:", video.id);
            const { error } = await supabase
              .from('learning_lesson_videos')
              .update(videoData)
              .eq('id', video.id);
              
            if (error) {
              console.error("Erro ao atualizar vídeo:", error);
              throw error;
            }
            
            console.log("Vídeo atualizado com sucesso");
            
            // Remover da lista de remainingVideoIds para não excluir depois
            const idIndex = remainingVideoIds.indexOf(video.id);
            if (idIndex !== -1) {
              remainingVideoIds.splice(idIndex, 1);
            }
          } else {
            // Inserir novo vídeo
            console.log("Inserindo novo vídeo");
            const { error } = await supabase
              .from('learning_lesson_videos')
              .insert(videoData);
              
            if (error) {
              console.error("Erro ao inserir vídeo:", error);
              throw error;
            }
            
            console.log("Novo vídeo inserido com sucesso");
          }
        }
        
        // Excluir vídeos que não estão mais no formulário
        if (remainingVideoIds.length > 0) {
          console.log("Excluindo vídeos que não estão mais no formulário:", remainingVideoIds);
          const { error } = await supabase
            .from('learning_lesson_videos')
            .delete()
            .in('id', remainingVideoIds);
            
          if (error) {
            console.error("Erro ao excluir vídeos antigos:", error);
            throw error;
          }
          
          console.log("Vídeos antigos excluídos com sucesso");
        }
      }
      
      console.log("Operação concluída com sucesso!");
      toast.success(aula ? "Aula atualizada com sucesso!" : "Aula criada com sucesso!");
      
      if (onSuccess) {
        console.log("Chamando callback onSuccess");
        onSuccess();
      }
      
      // Registrar operação bem-sucedida
      log("aula_saved", {
        lesson_id: lessonId,
        is_update: !!aula,
        has_videos: videos.length > 0,
        published: values.published
      });
      
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      logError("aula_save_error", {
        error: error.message || String(error),
        form_values: values,
        lesson_id: aula?.id,
        module_id: moduleId
      });
      
      toast.error(`Erro ao salvar: ${error.message || "Tente novamente"}`);
    } finally {
      console.log("Finalizando operação de salvamento");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Nova Aula"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="videos">Vídeos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detalhes" className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Aula</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título da aula" {...field} />
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva brevemente o conteúdo da aula" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Uma breve descrição do que será abordado nesta aula
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Imagem que será exibida como capa da aula
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-6">                  
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Publicada</FormLabel>
                          <FormDescription>
                            Aula visível para alunos
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              console.log("Switch toggled to:", checked);
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ai_assistant_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Assistente de IA</FormLabel>
                        <FormDescription>
                          Habilitar assistente para responder dúvidas sobre esta aula
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("ai_assistant_enabled") && (
                  <FormField
                    control={form.control}
                    name="ai_assistant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Assistente OpenAI</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: asst_LaPrWWHgQFw5wgJKAgTRI1mJ" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Insira o ID do assistente da API OpenAI que será usado para responder perguntas sobre esta aula.
                          Os IDs começam com "asst_" e podem ser encontrados no dashboard da OpenAI.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="videos" className="space-y-6">
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleAddVideo}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Adicionar Vídeo
                  </Button>
                </div>
                
                {form.watch("videos").length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Nenhum vídeo adicionado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em "Adicionar Vídeo" para incluir vídeos nesta aula
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {form.watch("videos").map((video, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Vídeo {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVideo(index)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`videos.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título</FormLabel>
                                <FormControl>
                                  <Input placeholder="Título do vídeo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`videos.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição (opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Breve descrição" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`videos.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vídeo</FormLabel>
                              <FormControl>
                                <VideoUpload
                                  value={field.value}
                                  onChange={(url, videoType, fileName, filePath, fileSize) => {
                                    field.onChange(url);
                                    handleVideoChange(index, url, videoType, fileName, filePath, fileSize);
                                  }}
                                  videoType={form.watch(`videos.${index}.video_type`) || "youtube"}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {video.duration_seconds && (
                          <div className="text-sm text-muted-foreground">
                            <span>Duração estimada: {formatDuration(video.duration_seconds)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {form.watch("videos").length > 0 && (
                      <div className="border-t pt-4 flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">Tempo total estimado:</span>
                          <span className="ml-2 text-sm">{formatDuration(calculateEstimatedTime() * 60)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="sticky bottom-0 pt-2 bg-white dark:bg-gray-950">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving || form.formState.isSubmitting}
                className="min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {aula ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  aula ? "Atualizar Aula" : "Criar Aula"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
