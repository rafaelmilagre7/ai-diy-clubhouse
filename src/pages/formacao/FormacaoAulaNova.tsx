
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Editor } from "@/components/editor/Editor";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { createStoragePublicPolicy } from "@/lib/supabase/rpc";
import { Loader2, PlusCircle, Trash } from "lucide-react";

// Schema para validação do formulário
const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  module_id: z.string({
    required_error: "Por favor selecione um módulo.",
  }),
  order_index: z.number().optional(),
  cover_image_url: z.string().optional(),
  is_published: z.boolean().default(false),
  videos: z.array(
    z.object({
      url: z.string().min(1, "A URL do vídeo é obrigatória"),
      title: z.string().min(1, "O título do vídeo é obrigatório"),
      description: z.string().optional(),
      videoType: z.enum(["youtube", "file"]),
      fileName: z.string().optional(),
      filePath: z.string().optional(),
      fileSize: z.number().optional(),
      order_index: z.number()
    })
  ).optional().default([]),
});

type FormValues = z.infer<typeof formSchema>;

type VideoItem = {
  url: string;
  title: string;
  description?: string;
  videoType: "youtube" | "file";
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  order_index: number;
};

const FormacaoAulaNova = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [modulos, setModulos] = useState<{ id: string; title: string; course_id: string }[]>([]);
  const [cursos, setCursos] = useState<{ id: string; title: string }[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string>("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<{
    url: string;
    videoType: "youtube" | "file";
    fileName?: string;
    filePath?: string;
    fileSize?: number;
  }>({
    url: "",
    videoType: "youtube"
  });
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  // Configurar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      order_index: 0,
      is_published: false,
      cover_image_url: "",
      videos: [],
    },
  });

  // Buscar cursos e módulos
  useEffect(() => {
    const fetchCursos = async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("id, title")
        .order("title");

      if (error) {
        toast.error("Erro ao carregar cursos");
        console.error("Erro ao carregar cursos:", error);
        return;
      }

      setCursos(data || []);
    };

    fetchCursos();
  }, []);

  // Buscar módulos baseado no curso selecionado
  useEffect(() => {
    const fetchModulos = async () => {
      if (!cursoSelecionado) {
        setModulos([]);
        return;
      }

      const { data, error } = await supabase
        .from("learning_modules")
        .select("id, title, course_id")
        .eq("course_id", cursoSelecionado)
        .order("title");

      if (error) {
        toast.error("Erro ao carregar módulos");
        console.error("Erro ao carregar módulos:", error);
        return;
      }

      setModulos(data || []);
    };

    fetchModulos();
  }, [cursoSelecionado]);

  // Verificar se o bucket de vídeos existe
  useEffect(() => {
    const ensureBucketExists = async () => {
      try {
        await createStoragePublicPolicy('learning_videos');
        console.log("Bucket learning_videos verificado/criado com sucesso!");
      } catch (error) {
        console.error("Erro ao verificar/criar bucket de vídeos:", error);
      }
    };
    
    ensureBucketExists();
  }, []);

  // Manipular a seleção de curso
  const handleCursoChange = (value: string) => {
    setCursoSelecionado(value);
    form.setValue("module_id", ""); // Resetar o módulo quando mudar o curso
  };

  // Manipular mudança no vídeo atual
  const handleVideoChange = (url: string, videoType: string, fileName?: string, filePath?: string, fileSize?: number) => {
    setCurrentVideo({
      url,
      videoType: videoType as "youtube" | "file",
      fileName,
      filePath,
      fileSize
    });
  };

  // Adicionar vídeo à lista
  const handleAddVideo = () => {
    if (!currentVideo.url || !videoTitle.trim()) {
      toast.error("Por favor, adicione uma URL e um título para o vídeo");
      return;
    }

    const newVideo: VideoItem = {
      url: currentVideo.url,
      title: videoTitle.trim(),
      description: videoDescription.trim() || undefined,
      videoType: currentVideo.videoType,
      fileName: currentVideo.fileName,
      filePath: currentVideo.filePath,
      fileSize: currentVideo.fileSize,
      order_index: videos.length
    };

    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);
    form.setValue("videos", updatedVideos);
    
    // Resetar campos
    setCurrentVideo({ url: "", videoType: "youtube" });
    setVideoTitle("");
    setVideoDescription("");
    
    toast.success("Vídeo adicionado com sucesso");
  };

  // Remover vídeo da lista
  const handleRemoveVideo = async (index: number) => {
    const videoToRemove = videos[index];
    
    // Se for um arquivo carregado no storage, tentar remover
    if (videoToRemove.videoType === "file" && videoToRemove.filePath) {
      try {
        const { error } = await supabase.storage
          .from("learning_videos")
          .remove([videoToRemove.filePath]);
          
        if (error) {
          console.error("Erro ao remover arquivo:", error);
        }
      } catch (error) {
        console.error("Erro ao tentar remover arquivo:", error);
      }
    }
    
    // Atualizar ordem dos vídeos restantes
    const updatedVideos = videos.filter((_, i) => i !== index)
      .map((video, i) => ({ ...video, order_index: i }));
    
    setVideos(updatedVideos);
    form.setValue("videos", updatedVideos);
    toast.success("Vídeo removido");
  };

  // Criar uma nova aula
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      if (!values.videos || values.videos.length === 0) {
        toast.warning("Por favor, adicione pelo menos um vídeo à aula");
        setIsLoading(false);
        return;
      }
      
      // Calcular tempo estimado com base nos vídeos (estimativa simples)
      // Cada vídeo adicionado considera-se 10 minutos em média
      const estimated_time_minutes = values.videos.length * 10;
      
      // Criar a aula
      const { data: lessonData, error: lessonError } = await supabase
        .from("learning_lessons")
        .insert({
          title: values.title,
          description: values.description || "",
          module_id: values.module_id,
          order_index: values.order_index || 0,
          cover_image_url: values.cover_image_url || null,
          is_published: values.is_published,
          estimated_time_minutes: estimated_time_minutes
        })
        .select();

      if (lessonError) throw lessonError;
      
      const lessonId = lessonData[0].id;
      
      // Adicionar os vídeos à aula
      const videoPromises = values.videos.map(async (video) => {
        return supabase
          .from("learning_lesson_videos")
          .insert({
            lesson_id: lessonId,
            title: video.title,
            description: video.description || null,
            url: video.url,
            video_type: video.videoType,
            video_file_name: video.fileName || null,
            video_file_path: video.filePath || null,
            file_size_bytes: video.fileSize || null,
            order_index: video.order_index,
            // Adicionar uma estimativa de duração baseada no tamanho do arquivo (se disponível)
            duration_seconds: video.fileSize ? Math.floor(video.fileSize / 100000) : 300, // estimativa aproximada
          });
      });
      
      await Promise.all(videoPromises);
      
      toast.success("Aula criada com sucesso!");
      navigate(`/formacao/aulas/${lessonId}`);
    } catch (error: any) {
      toast.error("Erro ao criar aula");
      console.error("Erro ao criar aula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormacaoAulasHeader 
        titulo="Nova Aula" 
        breadcrumb={true} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar uma nova aula
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Aula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Introdução à Inteligência Artificial" {...field} />
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
                        placeholder="Descreva o conteúdo desta aula"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição sobre o que será abordado nesta aula.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <FormLabel className="block mb-2">Curso</FormLabel>
                    <Select
                      value={cursoSelecionado}
                      onValueChange={handleCursoChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id}>
                            {curso.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="module_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Módulo</FormLabel>
                        <Select
                          disabled={!cursoSelecionado || modulos.length === 0}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modulos.map((modulo) => (
                              <SelectItem key={modulo.id} value={modulo.id}>
                                {modulo.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primeiro selecione um curso para ver os módulos disponíveis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order_index"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value?.toString() || "0"}
                          />
                        </FormControl>
                        <FormDescription>
                          Posição da aula dentro do módulo (0 é a primeira).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <Editor
                          value={field.value}
                          onChange={field.onChange}
                          type="image"
                        />
                      </FormControl>
                      <FormDescription>
                        Imagem que será exibida na listagem de aulas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção de Vídeos */}
              <div className="space-y-4 mt-6">
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold">Vídeos da Aula</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione os vídeos que serão exibidos nesta aula. É necessário adicionar pelo menos um vídeo.
                </p>

                {/* Formulário para adicionar vídeo */}
                <Card className="border border-dashed">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <FormLabel>Vídeo</FormLabel>
                        <VideoUpload 
                          value={currentVideo.url}
                          onChange={handleVideoChange}
                          videoType={currentVideo.videoType}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Título do Vídeo</FormLabel>
                        <Input
                          placeholder="Digite o título do vídeo"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <Textarea
                          placeholder="Digite uma descrição para o vídeo"
                          value={videoDescription}
                          onChange={(e) => setVideoDescription(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddVideo}
                        disabled={!currentVideo.url || !videoTitle.trim() || uploading}
                        className="w-full"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Vídeo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de vídeos adicionados */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Vídeos Adicionados: {videos.length}</h4>
                  
                  {videos.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-md bg-muted/20">
                      Nenhum vídeo adicionado até o momento. Adicione pelo menos um vídeo acima.
                    </p>
                  )}
                  
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-md p-3 bg-background">
                      <div className="flex-1 mr-4">
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {video.videoType === "youtube" ? "YouTube: " : "Arquivo: "}
                          {video.videoType === "file" ? video.fileName : video.url}
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveVideo(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/formacao/aulas")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || videos.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Aula"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default FormacaoAulaNova;
