
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/formacao/common/ImageUpload";
import { FileUpload } from "@/components/formacao/common/FileUpload";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AulaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula: LearningLesson | null;
  moduleId: string;
  onSuccess: () => void;
}

const aulaFormSchema = z.object({
  title: z.string().min(3, { message: "O título precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  estimated_time_minutes: z.coerce.number().min(0).default(0),
  ai_assistant_enabled: z.boolean().default(true),
  ai_assistant_prompt: z.string().optional(),
  published: z.boolean().default(false),
  videos: z
    .array(
      z.object({
        title: z.string().min(1, "Título é obrigatório"),
        url: z.string().url("URL inválida"),
        description: z.string().optional(),
        thumbnail_url: z.string().optional(),
      })
    )
    .default([]),
});

type AulaFormValues = z.infer<typeof aulaFormSchema>;

export const AulaWizard = ({
  open,
  onOpenChange,
  aula,
  moduleId,
  onSuccess,
}: AulaWizardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const isEditing = !!aula;

  // Definir os passos do wizard
  const steps = [
    { id: "basic", title: "Informações Básicas" },
    { id: "media", title: "Imagem de Capa" },
    { id: "videos", title: "Vídeos da Aula" },
    { id: "ai", title: "Assistente IA" },
    { id: "publish", title: "Publicação" },
  ];
  
  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: {
      title: aula?.title || "",
      description: aula?.description || "",
      cover_image_url: aula?.cover_image_url || "",
      estimated_time_minutes: aula?.estimated_time_minutes || 0,
      ai_assistant_enabled: aula?.ai_assistant_enabled ?? true,
      ai_assistant_prompt: aula?.ai_assistant_prompt || "",
      published: aula?.published || false,
      videos: [],
    },
  });
  
  // Buscar vídeos existentes se for edição
  useEffect(() => {
    if (isEditing && aula) {
      const fetchVideos = async () => {
        try {
          const { data, error } = await supabase
            .from("learning_lesson_videos")
            .select("*")
            .eq("lesson_id", aula.id)
            .order("order_index");
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            setVideos(data);
            form.setValue("videos", data.map(v => ({
              title: v.title,
              url: v.url,
              description: v.description || '',
              thumbnail_url: v.thumbnail_url || ''
            })));
          }
        } catch (error) {
          console.error("Erro ao buscar vídeos:", error);
        }
      };
      
      fetchVideos();
    }
  }, [aula, isEditing, form]);

  const onSubmit = async (values: AulaFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Atualizar aula existente
        const { error } = await supabase
          .from('learning_lessons')
          .update({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            estimated_time_minutes: values.estimated_time_minutes,
            ai_assistant_enabled: values.ai_assistant_enabled,
            ai_assistant_prompt: values.ai_assistant_prompt,
            published: values.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', aula!.id);
          
        if (error) throw error;
        
        // Atualizar vídeos da aula
        if (values.videos.length > 0) {
          // Primeiro, vamos excluir os vídeos existentes para evitar duplicados
          await supabase
            .from('learning_lesson_videos')
            .delete()
            .eq('lesson_id', aula!.id);
            
          // Agora inserimos os novos vídeos
          const videosToInsert = values.videos.map((video, index) => ({
            lesson_id: aula!.id,
            title: video.title,
            url: video.url,
            description: video.description || null,
            thumbnail_url: video.thumbnail_url || null,
            order_index: index,
          }));
          
          const { error: videoError } = await supabase
            .from('learning_lesson_videos')
            .insert(videosToInsert);
            
          if (videoError) throw videoError;
        }
        
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Verificar ordem máxima atual
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('learning_lessons')
          .select('order_index')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (maxOrderError) throw maxOrderError;
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].order_index + 1) 
          : 0;
        
        // Criar nova aula
        const { data: newLesson, error } = await supabase
          .from('learning_lessons')
          .insert({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            estimated_time_minutes: values.estimated_time_minutes,
            ai_assistant_enabled: values.ai_assistant_enabled,
            ai_assistant_prompt: values.ai_assistant_prompt,
            published: values.published,
            module_id: moduleId,
            order_index: nextOrder,
            content: {}
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Inserir vídeos para a nova aula
        if (values.videos.length > 0 && newLesson) {
          const videosToInsert = values.videos.map((video, index) => ({
            lesson_id: newLesson.id,
            title: video.title,
            url: video.url,
            description: video.description || null,
            thumbnail_url: video.thumbnail_url || null,
            order_index: index,
          }));
          
          const { error: videoError } = await supabase
            .from('learning_lesson_videos')
            .insert(videosToInsert);
            
          if (videoError) throw videoError;
        }
        
        toast.success("Aula criada com sucesso!");
      }
      
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast.error("Ocorreu um erro ao salvar a aula. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setCurrentStep(0);
    setVideos([]);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const addVideo = () => {
    const currentVideos = form.getValues().videos || [];
    form.setValue("videos", [
      ...currentVideos,
      { title: "", url: "", description: "", thumbnail_url: "" },
    ]);
  };
  
  const removeVideo = (index: number) => {
    const currentVideos = [...form.getValues().videos];
    currentVideos.splice(index, 1);
    form.setValue("videos", currentVideos);
  };
  
  const handleYoutubeUrlChange = (index: number, value: string) => {
    // Extrair ID do YouTube da URL
    let videoId = "";
    try {
      if (value.includes("youtube.com/watch")) {
        const url = new URL(value);
        videoId = url.searchParams.get("v") || "";
      } else if (value.includes("youtu.be/")) {
        videoId = value.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      
      if (videoId) {
        // Se conseguimos extrair um ID, atualizar a thumbnail
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Gerar URL de embed
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        const videos = form.getValues().videos;
        videos[index].url = embedUrl;
        videos[index].thumbnail_url = thumbnailUrl;
        form.setValue("videos", videos);
      }
    } catch (e) {
      console.error("Erro ao processar URL do YouTube:", e);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Aula" : "Criar Nova Aula"}</SheetTitle>
          <SheetDescription>
            {isEditing 
              ? "Atualize as informações da aula existente." 
              : "Preencha as informações para criar uma nova aula."}
          </SheetDescription>
        </SheetHeader>
        
        {/* Indicador de progresso */}
        <div className="flex justify-center mt-4 mb-6">
          <nav aria-label="Etapas do cadastro">
            <ol className="flex flex-wrap gap-2">
              {steps.map((step, idx) => (
                <li 
                  key={step.id} 
                  className={cn(
                    "flex items-center", 
                    idx < steps.length - 1 ? "mr-4" : ""
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                    idx === currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : idx < currentStep 
                        ? "bg-muted-foreground/30 text-muted-foreground"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm hidden sm:inline-block",
                    idx === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="text-muted-foreground mx-2 hidden sm:inline-block">
                      &rarr;
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Passo 1: Informações Básicas */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Aula</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título da aula" {...field} />
                      </FormControl>
                      <FormDescription>Este será o nome exibido para os alunos.</FormDescription>
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
                          placeholder="Digite uma breve descrição da aula" 
                          rows={3}
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        Uma descrição clara ajudará os alunos a entenderem o conteúdo da aula.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimated_time_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Estimado (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Tempo estimado para conclusão desta aula.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Passo 2: Imagem de Capa */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Imagem de Capa (Opcional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          bucketName="learning_covers"
                          folderPath="aulas"
                        />
                      </FormControl>
                      <FormDescription>
                        A imagem será exibida como capa da aula.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Passo 3: Vídeos da Aula */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Vídeos da Aula</h3>
                  <Button 
                    type="button" 
                    onClick={addVideo} 
                    size="sm" 
                    variant="outline"
                  >
                    Adicionar Vídeo
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {form.watch("videos").map((_, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeVideo(index)}
                      >
                        <span className="sr-only">Remover vídeo</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </Button>
                      
                      <FormField
                        control={form.control}
                        name={`videos.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do Vídeo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite o título do vídeo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`videos.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Vídeo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Cole o link do vídeo do YouTube" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleYoutubeUrlChange(index, e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              URL do YouTube: https://www.youtube.com/watch?v=VIDEO_ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`videos.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descrição do vídeo" 
                                rows={2}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Prévia do vídeo */}
                      {form.watch(`videos.${index}.thumbnail_url`) && (
                        <div className="mt-4 border rounded-md overflow-hidden">
                          <img 
                            src={form.watch(`videos.${index}.thumbnail_url`)} 
                            alt="Prévia do vídeo"
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {form.watch("videos").length === 0 && (
                    <div className="text-center py-8 border rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video mx-auto text-muted-foreground"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                      <p className="mt-4 text-muted-foreground">
                        Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Passo 4: Assistente IA */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="ai_assistant_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Assistente IA</FormLabel>
                        <FormDescription>
                          Habilitar assistente de IA para ajudar os alunos nesta aula.
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
                
                {form.watch("ai_assistant_enabled") && (
                  <FormField
                    control={form.control}
                    name="ai_assistant_prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt para Assistente IA (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instruções específicas para o assistente de IA desta aula"
                            rows={5}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Instruções personalizadas para o comportamento do assistente de IA.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
            
            {/* Passo 5: Publicação */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publicar aula</FormLabel>
                        <FormDescription>
                          Quando ativado, a aula será visível para os alunos.
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
                
                <div className="border rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium">Resumo da Aula</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Título:</span>
                      <span className="font-medium">{form.watch("title") || "Sem título"}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Descrição:</span>
                      <span className="font-medium max-w-[60%] text-right truncate">
                        {form.watch("description") || "Sem descrição"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo estimado:</span>
                      <span className="font-medium">
                        {form.watch("estimated_time_minutes")} minutos
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vídeos:</span>
                      <span className="font-medium">
                        {form.watch("videos").length} vídeos adicionados
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assistente IA:</span>
                      <span className="font-medium">
                        {form.watch("ai_assistant_enabled") ? "Habilitado" : "Desabilitado"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={cn(
                        "font-medium",
                        form.watch("published") ? "text-green-600" : "text-amber-600"
                      )}>
                        {form.watch("published") ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <SheetFooter className="pt-4 border-t">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      isEditing ? "Atualizar Aula" : "Criar Aula"
                    )}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
