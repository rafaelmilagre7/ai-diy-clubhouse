import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  Save,
  FileText,
  Clock,
  Eye,
  Trash2,
  ImagePlus,
  Video,
  Upload,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres",
  }),
  description: z.string().min(30, {
    message: "A descrição deve ter pelo menos 30 caracteres",
  }),
  category: z.enum(["revenue", "operational", "strategy"], {
    invalid_type_error: "Selecione uma categoria válida",
  }),
  difficulty: z.enum(["easy", "medium", "advanced"], {
    invalid_type_error: "Selecione uma dificuldade válida",
  }),
  estimated_time: z.number().min(5, {
    message: "O tempo estimado deve ser de pelo menos 5 minutos",
  }),
  success_rate: z.number().min(0).max(100, {
    message: "A taxa de sucesso deve estar entre 0 e 100%",
  }),
  thumbnail_url: z.string().optional(),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "revenue",
      difficulty: "medium",
      estimated_time: 30,
      success_rate: 80,
      thumbnail_url: "",
      published: false,
    },
  });
  
  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setSolution(data as Solution);
        
        form.reset({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          estimated_time: data.estimated_time,
          success_rate: data.success_rate,
          thumbnail_url: data.thumbnail_url || "",
          published: data.published,
        });
      } catch (error) {
        console.error("Error fetching solution:", error);
        toast({
          title: "Erro ao carregar solução",
          description: "Ocorreu um erro ao tentar carregar os detalhes da solução.",
          variant: "destructive",
        });
        navigate("/admin/solutions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, form, toast, navigate]);
  
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const solutionData = {
        ...values,
        updated_at: new Date().toISOString(),
      };
      
      if (id) {
        const { error } = await supabase
          .from("solutions")
          .update(solutionData)
          .eq("id", id);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const newSolution = {
          ...solutionData,
          created_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Solução criada",
          description: "A nova solução foi criada com sucesso.",
        });
        
        navigate(`/admin/solutions/${data.id}`);
      }
    } catch (error) {
      console.error("Error saving solution:", error);
      toast({
        title: "Erro ao salvar solução",
        description: "Ocorreu um erro ao tentar salvar a solução.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => navigate("/admin/solutions")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Editar Solução" : "Nova Solução"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {id
              ? "Atualize os detalhes e conteúdo da solução"
              : "Crie uma nova solução para a plataforma DIY"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(id ? `/solution/${id}` : "/admin/solutions")}
          >
            <Eye className="mr-2 h-4 w-4" />
            {id ? "Visualizar" : "Cancelar"}
          </Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Solução</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Assistente de vendas no Instagram" {...field} />
                        </FormControl>
                        <FormDescription>
                          Um título claro e descritivo para a solução
                        </FormDescription>
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
                            placeholder="Descreva brevemente o que esta solução faz e quais benefícios ela traz..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Uma descrição concisa que explique o valor para o membro
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="revenue">Aumento de Receita</SelectItem>
                              <SelectItem value="operational">Otimização Operacional</SelectItem>
                              <SelectItem value="strategy">Gestão Estratégica</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            A trilha à qual esta solução pertence
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Dificuldade</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a dificuldade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Fácil</SelectItem>
                              <SelectItem value="medium">Médio</SelectItem>
                              <SelectItem value="advanced">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            O nível de complexidade da implementação
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="estimated_time"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Tempo Estimado (minutos)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Input
                                  type="number"
                                  min={5}
                                  className="w-20" 
                                  value={value}
                                  onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
                                  {...field}
                                />
                                <span className="text-muted-foreground">minutos</span>
                              </div>
                              <Slider
                                min={5}
                                max={120}
                                step={5}
                                value={[value]}
                                onValueChange={(vals) => onChange(vals[0])}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tempo aproximado para completar a implementação
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="success_rate"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Taxa de Sucesso (%)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="w-20"
                                  value={value}
                                  onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
                                  {...field}
                                />
                                <span className="text-muted-foreground">%</span>
                              </div>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[value]}
                                onValueChange={(vals) => onChange(vals[0])}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Percentual estimado de membros que completam com sucesso
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem de Capa</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="border rounded-md flex items-center justify-center h-40 bg-muted/40">
                              {field.value ? (
                                <img
                                  src={field.value}
                                  alt="Thumbnail"
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <div className="flex flex-col items-center p-4 text-center">
                                  <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Nenhuma imagem selecionada
                                  </p>
                                </div>
                              )}
                            </div>
                            <Input
                              placeholder="URL da imagem"
                              {...field}
                            />
                            <Button type="button" variant="outline" className="w-full">
                              <Upload className="mr-2 h-4 w-4" />
                              Enviar Imagem
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Imagem principal da solução (1200x400 recomendado)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status de Publicação</FormLabel>
                          <FormDescription>
                            {field.value
                              ? "Esta solução está visível para os membros"
                              : "Esta solução está salva como rascunho"}
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
                  
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Prévia</h3>
                        <Badge variant="outline" className={field => 
                          form.watch("published") 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }>
                          {form.watch("published") ? "Publicada" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="rounded-lg border overflow-hidden">
                        <div className="bg-gradient-to-r from-viverblue to-viverblue-dark h-16 w-full"></div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1">{form.watch("title") || "Título da Solução"}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{form.watch("estimated_time") || 0} min</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="modules" className="space-y-6">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Módulos da Solução</h3>
                      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados.
                      </p>
                      <div className="mt-6">
                        {id ? (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Cada solução é estruturada em 8 módulos sequenciais:
                            </p>
                            <ul className="space-y-2 text-left max-w-md mx-auto">
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">1</Badge>
                                <span>Landing - Apresentação inicial (30s)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">2</Badge>
                                <span>Visão Geral - Contexto e case (2 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">3</Badge>
                                <span>Preparação - Requisitos e setup (3-5 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">4</Badge>
                                <span>Implementação - Passo a passo (15-30 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">5</Badge>
                                <span>Verificação - Testes de funcionamento (2-5 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">6</Badge>
                                <span>Resultados - Primeiros resultados (5 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">7</Badge>
                                <span>Otimização - Melhorias e ajustes (5 min)</span>
                              </li>
                              <li className="flex items-center">
                                <Badge variant="outline" className="mr-2">8</Badge>
                                <span>Celebração - Conquista e próximos passos (1 min)</span>
                              </li>
                            </ul>
                            <Button type="button" className="mt-4">
                              <Play className="mr-2 h-4 w-4" />
                              Configurar Módulos
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                            <p className="text-sm">
                              Você precisa salvar a solução primeiro para configurar os módulos.
                            </p>
                            <Button 
                              type="submit"
                              onClick={form.handleSubmit(onSubmit)}
                              className="mt-4"
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Salvar Solução
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-6">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Recursos e Materiais</h3>
                      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        Gerencie vídeos, imagens e arquivos associados a esta solução.
                      </p>
                      <div className="mt-6">
                        {id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                              <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="font-medium">Enviar Vídeo</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  MP4, WebM (máx. 100MB)
                                </p>
                              </Card>
                              <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="font-medium">Enviar Imagem</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  JPG, PNG, WebP (máx. 5MB)
                                </p>
                              </Card>
                              <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="font-medium">Enviar Arquivo</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, XLSX, DOCX (máx. 10MB)
                                </p>
                              </Card>
                            </div>
                            <p className="text-sm text-muted-foreground mt-6">
                              Nenhum recurso adicionado ainda. Envie arquivos para começar.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                            <p className="text-sm">
                              Você precisa salvar a solução primeiro para gerenciar recursos.
                            </p>
                            <Button 
                              type="submit"
                              onClick={form.handleSubmit(onSubmit)}
                              className="mt-4"
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Salvar Solução
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default SolutionEditor;
