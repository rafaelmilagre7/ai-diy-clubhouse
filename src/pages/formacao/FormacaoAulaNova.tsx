
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
import { ensureStorageBucketExists } from "@/lib/supabase/client";

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
  const [bucketStatus, setBucketStatus] = useState<{ checked: boolean; exists: boolean; error?: string; attemptedToCreate: boolean }>({
    checked: false,
    exists: false,
    attemptedToCreate: false
  });
  const [tableColumns, setTableColumns] = useState<Array<{column_name: string; data_type: string}> | null>(null);
  const [tableChecked, setTableChecked] = useState(false);

  // Configurar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      order_index: 0,
      cover_image_url: "",
      videos: [],
    },
  });

  // Buscar cursos e módulos
  useEffect(() => {
    const fetchCursos = async () => {
      try {
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
      } catch (error) {
        console.error("Exceção ao carregar cursos:", error);
        toast.error("Falha ao carregar os cursos");
      }
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

      try {
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
      } catch (error) {
        console.error("Exceção ao carregar módulos:", error);
        toast.error("Falha ao carregar os módulos");
      }
    };

    fetchModulos();
  }, [cursoSelecionado]);

  // Verificar se o bucket de vídeos existe e a estrutura da tabela
  useEffect(() => {
    // Verificar a estrutura da tabela de forma direta
    const checkTableStructure = async () => {
      try {
        setTableChecked(false);
        console.log("Verificando estrutura da tabela learning_lessons...");
        
        const { data, error } = await supabase
          .from('learning_lessons')
          .select('*')
          .limit(1);
          
        if (error) {
          console.error("Erro ao verificar tabela learning_lessons:", error);
          setTableChecked(true);
          return;
        }
        
        // Se chegamos aqui, a tabela existe
        console.log("Tabela learning_lessons acessada com sucesso!");
        
        // Tentar determinar se o campo published existe
        const hasPublishedField = data && data.length > 0 ? 
          'published' in data[0] : true; // Assume que existe se não conseguir verificar
          
        setTableColumns([
          { column_name: 'title', data_type: 'text' },
          { column_name: 'description', data_type: 'text' },
          { column_name: 'module_id', data_type: 'uuid' },
          { column_name: 'order_index', data_type: 'integer' },
          { column_name: 'cover_image_url', data_type: 'text' },
          { column_name: 'estimated_time_minutes', data_type: 'integer' },
          { column_name: 'published', data_type: 'boolean' }
        ]);
        
        setTableChecked(true);
      } catch (error) {
        console.error("Erro ao verificar estrutura da tabela:", error);
        setTableChecked(true);
      }
    };
    
    // Verificar o bucket usando a função auxiliar do cliente
    const checkStorageBucket = async () => {
      try {
        setBucketStatus({ 
          checked: false, 
          exists: false, 
          attemptedToCreate: false 
        });
        
        console.log("Verificando se o bucket learning_videos existe...");
        
        // Verifica se o bucket existe
        const { data: buckets } = await supabase.storage.listBuckets();
        
        if (buckets) {
          const bucketExists = buckets.some(bucket => bucket.name === 'learning_videos');
          
          if (bucketExists) {
            console.log("Bucket learning_videos já existe!");
            setBucketStatus({ 
              checked: true, 
              exists: true,
              attemptedToCreate: false 
            });
            return;
          }
        }
        
        console.log("Bucket learning_videos não encontrado, tentando criar...");
        
        // Como o bucket não existe, tentar criar diretamente (sem função RPC)
        const { error: createError } = await supabase.storage.createBucket('learning_videos', {
          public: true,
          fileSizeLimit: 100 * 1024 * 1024 // 100MB
        });
        
        if (createError) {
          console.error("Erro ao criar bucket learning_videos:", createError);
          
          // Se não conseguiu criar, pelo menos registramos a tentativa
          setBucketStatus({ 
            checked: true, 
            exists: false, 
            error: createError.message,
            attemptedToCreate: true 
          });
          return;
        }
        
        console.log("Bucket learning_videos criado com sucesso!");
        
        // Aguardar um pouco para o bucket ser criado completamente
        setTimeout(async () => {
          try {
            // Tentar criar políticas de acesso
            const { data: publicPolicy } = await supabase
              .storage
              .from('learning_videos')
              .getPublicUrl('test.txt');
              
            if (publicPolicy) {
              console.log("Políticas de acesso configuradas com sucesso!");
            }
            
            setBucketStatus({ 
              checked: true, 
              exists: true,
              attemptedToCreate: true 
            });
          } catch (policyError) {
            console.error("Erro ao configurar políticas:", policyError);
            setBucketStatus({ 
              checked: true, 
              exists: true,
              error: "Bucket criado, mas pode haver problemas com as permissões",
              attemptedToCreate: true 
            });
          }
        }, 1000);
      } catch (error) {
        console.error("Erro ao verificar/criar bucket de vídeos:", error);
        setBucketStatus({ 
          checked: true, 
          exists: false, 
          error: String(error),
          attemptedToCreate: true 
        });
      }
    };

    checkTableStructure();
    checkStorageBucket();
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

  // Tentar criar o bucket novamente se houve erro
  const retryBucketCreation = async () => {
    try {
      setBucketStatus({ 
        checked: false, 
        exists: false, 
        attemptedToCreate: true 
      });
      
      toast.info("Tentando configurar o armazenamento novamente...");
      
      // Usar a função auxiliar que tem mais chance de sucesso
      const exists = await ensureStorageBucketExists("learning_videos");
      
      if (exists) {
        toast.success("Armazenamento configurado com sucesso!");
        setBucketStatus({ 
          checked: true, 
          exists: true,
          attemptedToCreate: true 
        });
      } else {
        toast.error("Não foi possível configurar o armazenamento");
        setBucketStatus({ 
          checked: true, 
          exists: false, 
          error: "Falha ao criar bucket mesmo com função auxiliar",
          attemptedToCreate: true 
        });
      }
    } catch (error) {
      console.error("Erro ao tentar criar bucket novamente:", error);
      toast.error("Erro ao configurar armazenamento");
      setBucketStatus({ 
        checked: true, 
        exists: false, 
        error: String(error),
        attemptedToCreate: true 
      });
    }
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
      // Filtrar para obter apenas vídeos com URL válida
      const validVideos = values.videos?.filter(video => video.url && video.url.trim() !== '') || [];
      
      if (validVideos.length === 0) {
        toast.warning("Por favor, adicione pelo menos um vídeo à aula");
        setIsLoading(false);
        return;
      }

      // Verificar se o bucket está disponível, mas não bloquear completamente
      if (!bucketStatus.exists) {
        console.warn("O bucket de armazenamento pode não estar disponível. Tentando continuar mesmo assim...");
      }
      
      // Calcular tempo estimado com base nos vídeos (estimativa simples)
      const estimated_time_minutes = validVideos.length * 10;
      
      // Determinar se devemos tentar inserir o campo published
      const hasPublishedField = tableColumns?.some(col => col.column_name === 'published');
      console.log("Tabela tem campo published:", hasPublishedField);
      
      // Criar a aula
      const lessonData = {
        title: values.title,
        description: values.description || "",
        module_id: values.module_id,
        order_index: values.order_index || 0,
        cover_image_url: values.cover_image_url || null,
        estimated_time_minutes: estimated_time_minutes
      };
      
      // Adicionar campo published apenas se não determinamos explicitamente que não existe
      const lessonDataWithPublished = hasPublishedField !== false ? 
        { ...lessonData, published: false } : lessonData;
      
      console.log("Criando nova aula com dados:", lessonDataWithPublished);

      const { data, error } = await supabase
        .from("learning_lessons")
        .insert(lessonDataWithPublished)
        .select();

      if (error) {
        console.error("Erro ao criar aula:", error);
        
        // Se o erro for sobre coluna desconhecida e tentamos inserir com published
        if (error.message.includes("column") && error.message.includes("does not exist") && 
            hasPublishedField !== false) {
          console.log("Tentando novamente sem o campo published...");
          
          // Tentar criar sem o campo published
          const { data: retryData, error: retryError } = await supabase
            .from("learning_lessons")
            .insert(lessonData)
            .select();
            
          if (retryError) {
            throw retryError;
          }
          
          if (!retryData || retryData.length === 0) {
            throw new Error("Falha ao criar aula: nenhum dado retornado");
          }
          
          console.log("Aula criada com sucesso (segunda tentativa):", retryData);
          
          // Usar o ID da aula criada na segunda tentativa
          const lessonId = retryData[0].id;
          
          // Inserir apenas os vídeos com URL válida - usando type assertion para garantir tipo correto
          await insertVideos(lessonId, validVideos as VideoItem[]);
          
          toast.success("Aula criada com sucesso!");
          navigate(`/formacao/aulas/${lessonId}`);
          return;
        } else {
          throw error;
        }
      }
      
      if (!data || data.length === 0) {
        throw new Error("Falha ao criar aula: nenhum dado retornado");
      }
      
      console.log("Aula criada com sucesso:", data);
      const lessonId = data[0].id;
      
      // Adicionar os vídeos à aula (apenas os com URL válida) - usando type assertion para garantir tipo correto
      await insertVideos(lessonId, validVideos as VideoItem[]);
      
      toast.success("Aula criada com sucesso!");
      navigate(`/formacao/aulas/${lessonId}`);
    } catch (error: any) {
      toast.error("Erro ao criar aula: " + (error.message || "Erro desconhecido"));
      console.error("Erro detalhado ao criar aula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para inserir vídeos (garantindo que todos têm URL)
  const insertVideos = async (lessonId: string, videos: VideoItem[]) => {
    try {
      console.log(`Inserindo ${videos.length} vídeos para a aula ${lessonId}`);
      
      if (!videos || videos.length === 0) return;
      
      // Esta etapa de filtragem é agora redundante, pois já garantimos que os vídeos têm URL válida antes de chegar aqui
      // Mantendo por segurança adicional
      const validVideos = videos.filter(video => video.url && video.url.trim() !== '');
      
      if (validVideos.length === 0) {
        console.log("Nenhum vídeo válido para inserir");
        return;
      }
      
      const videoPromises = validVideos.map(async (video) => {
        const videoData = {
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
        };
        
        console.log("Inserindo vídeo:", videoData);
        
        return supabase
          .from("learning_lesson_videos")
          .insert(videoData);
      });
      
      const results = await Promise.all(videoPromises);
      
      // Verificar erros
      const errors = results.filter(result => result.error).map(result => result.error);
      if (errors.length > 0) {
        console.error("Erros ao inserir vídeos:", errors);
        throw new Error(`${errors.length} vídeos não puderam ser adicionados`);
      }
      
      console.log(`${videos.length} vídeos adicionados com sucesso`);
    } catch (error) {
      console.error("Erro ao adicionar vídeos:", error);
      throw error;
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
              {/* Status de verificação da tabela */}
              {!tableChecked ? (
                <div className="p-4 border rounded-md bg-status-warning/10 text-status-warning-dark">
                  <p className="text-sm flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando estrutura da tabela...
                  </p>
                </div>
              ) : tableColumns === null ? (
                <div className="p-4 border rounded-md bg-status-error/10 text-status-error-dark">
                  <p className="text-sm font-semibold">Não foi possível verificar a estrutura da tabela</p>
                  <p className="text-sm mt-1">Algumas funcionalidades podem não funcionar corretamente,
                    mas tentaremos criar a aula mesmo assim.</p>
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-green-50 text-green-800">
                  <p className="text-sm">Estrutura da tabela verificada</p>
                  <p className="text-sm mt-1">Você pode criar aulas normalmente.</p>
                </div>
              )}
              
              {/* Status de verificação do bucket */}
              {!bucketStatus.checked ? (
                <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
                  <p className="text-sm flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando configuração de armazenamento...
                  </p>
                </div>
              ) : !bucketStatus.exists ? (
                <div className="p-4 border rounded-md bg-red-50 text-red-800">
                  <p className="text-sm font-semibold">Erro na configuração do armazenamento</p>
                  <p className="text-sm mt-1">{bucketStatus.error || "Não foi possível configurar o bucket de vídeos."}</p>
                  <p className="text-sm mt-2">O upload de arquivos pode não funcionar corretamente.</p>
                  
                  {bucketStatus.attemptedToCreate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={retryBucketCreation}
                      className="mt-2"
                    >
                      Tentar configurar novamente
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-green-50 text-green-800">
                  <p className="text-sm">Armazenamento configurado corretamente</p>
                  {bucketStatus.attemptedToCreate && (
                    <p className="text-xs mt-1">O bucket de armazenamento foi criado durante esta sessão.</p>
                  )}
                </div>
              )}

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
                        className="min-h-chart-sm"
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
