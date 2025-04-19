
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash, Save, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tool, VideoTutorial } from '@/types/toolTypes';
import { Badge } from '@/components/ui/badge';

// Define o schema de validação para o formulário
const toolFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  official_url: z.string().url({ message: 'URL inválida' }),
  category: z.string().min(1, { message: 'Selecione uma categoria' }),
  status: z.boolean().default(true),
  logo_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  video_tutorials: z.array(
    z.object({
      title: z.string().min(1, { message: 'Título é obrigatório' }),
      url: z.string().url({ message: 'URL inválida' })
    })
  ).optional(),
});

type ToolFormValues = z.infer<typeof toolFormSchema>;

const AdminToolEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [videoTutorials, setVideoTutorials] = useState<VideoTutorial[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const isNew = !id || id === 'new';

  // Inicializar o formulário
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: '',
      description: '',
      official_url: '',
      category: '',
      status: true,
      logo_url: '',
      tags: [],
      video_tutorials: [],
    },
  });

  // Carregar os dados da ferramenta para edição
  useEffect(() => {
    const fetchTool = async () => {
      if (isNew) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Preencher o formulário com os dados
        form.reset({
          name: data.name,
          description: data.description,
          official_url: data.official_url,
          category: data.category,
          status: data.status,
          logo_url: data.logo_url || '',
          tags: data.tags || [],
          video_tutorials: data.video_tutorials || [],
        });
        
        // Preencher o estado de vídeos tutoriais
        setVideoTutorials(data.video_tutorials || []);
        
        // Setar preview do logo
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        
      } catch (error: any) {
        console.error('Erro ao carregar ferramenta:', error);
        toast({
          title: 'Erro ao carregar ferramenta',
          description: error.message || 'Ocorreu um erro ao carregar os dados da ferramenta.',
          variant: 'destructive',
        });
        navigate('/admin/tools');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTool();
  }, [id, isNew, form, navigate, toast]);

  // Função para adicionar uma tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    const normalizedTag = tagInput.trim().toLowerCase();
    
    // Verificar se a tag já existe
    if (currentTags.includes(normalizedTag)) {
      toast({
        title: 'Tag duplicada',
        description: 'Esta tag já foi adicionada.',
        variant: 'destructive',
      });
      return;
    }
    
    form.setValue('tags', [...currentTags, normalizedTag]);
    setTagInput('');
  };

  // Função para remover uma tag
  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  // Função para adicionar um vídeo tutorial
  const addVideoTutorial = () => {
    setVideoTutorials([...videoTutorials, { title: '', url: '' }]);
  };

  // Função para atualizar um vídeo tutorial
  const updateVideoTutorial = (index: number, field: 'title' | 'url', value: string) => {
    const updatedTutorials = [...videoTutorials];
    updatedTutorials[index] = {
      ...updatedTutorials[index],
      [field]: value,
    };
    setVideoTutorials(updatedTutorials);
  };

  // Função para remover um vídeo tutorial
  const removeVideoTutorial = (index: number) => {
    setVideoTutorials(videoTutorials.filter((_, i) => i !== index));
  };

  // Função para lidar com o upload do logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Criar URL para preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Função para remover o logo
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    form.setValue('logo_url', '');
  };

  // Função para fazer upload do logo para o Supabase Storage
  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('tool_logos')
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Obter a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('tool_logos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  // Enviar o formulário
  const onSubmit = async (data: ToolFormValues) => {
    try {
      setSaving(true);
      
      // Incluir os vídeos tutoriais no objeto de dados
      data.video_tutorials = videoTutorials;
      
      // Upload do logo, se houver
      if (logoFile) {
        const logoUrl = await uploadLogo(logoFile);
        data.logo_url = logoUrl;
      }
      
      let result;
      
      if (isNew) {
        // Criar nova ferramenta
        result = await supabase
          .from('tools')
          .insert([data])
          .select();
      } else {
        // Atualizar ferramenta existente
        result = await supabase
          .from('tools')
          .update(data)
          .eq('id', id)
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: isNew ? 'Ferramenta criada' : 'Ferramenta atualizada',
        description: isNew
          ? 'A nova ferramenta foi criada com sucesso.'
          : 'As alterações foram salvas com sucesso.',
      });
      
      // Redirecionar para a lista de ferramentas
      navigate('/admin/tools');
      
    } catch (error: any) {
      console.error('Erro ao salvar ferramenta:', error);
      toast({
        title: 'Erro ao salvar ferramenta',
        description: error.message || 'Ocorreu um erro ao tentar salvar a ferramenta.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#0ABAB5]" />
          <p className="mt-4 text-muted-foreground">Carregando ferramenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/tools" className="inline-flex items-center text-sm text-[#0ABAB5] hover:underline mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para lista de ferramentas
          </Link>
          <h1 className="text-2xl font-bold">{isNew ? 'Nova Ferramenta' : 'Editar Ferramenta'}</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="media">Logo e Tags</TabsTrigger>
              <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
            </TabsList>
            
            {/* Aba de Informações Básicas */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Ferramenta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: ChatGPT" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nome da ferramenta como é conhecido no mercado.
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
                              placeholder="Descreva o que a ferramenta faz, seus principais recursos e benefícios..." 
                              rows={6}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Descrição detalhada da ferramenta, seus casos de uso e diferenciais.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="official_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Oficial</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://www.example.com" 
                              type="url"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            URL do site oficial da ferramenta.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="IA">IA</SelectItem>
                                <SelectItem value="Automação">Automação</SelectItem>
                                <SelectItem value="No-Code">No-Code</SelectItem>
                                <SelectItem value="Integração">Integração</SelectItem>
                                <SelectItem value="Produtividade">Produtividade</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel>Status da Ferramenta</FormLabel>
                              <FormDescription>
                                Ativa para exibir aos membros.
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Aba de Logo e Tags */}
            <TabsContent value="media" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <div>
                      <FormLabel className="mb-2 block">Logo da Ferramenta</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-24 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Preview" 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <div className="text-2xl font-bold text-muted-foreground">
                              LOGO
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="flex-1"
                          />
                          <FormDescription>
                            Formato recomendado: quadrado, PNG ou JPG, máximo 2MB.
                          </FormDescription>
                          {logoPreview && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={removeLogo}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remover logo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel className="mb-2 block">Tags</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {form.watch('tags')?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                              onClick={() => removeTag(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {(!form.watch('tags') || form.watch('tags').length === 0) && (
                          <p className="text-sm text-muted-foreground">Nenhuma tag adicionada.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite uma tag e pressione adicionar"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={addTag}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                      <FormDescription className="mt-2">
                        Adicione tags para facilitar a busca e o filtro das ferramentas.
                      </FormDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Aba de Tutoriais */}
            <TabsContent value="tutorials" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Tutoriais em Vídeo</h3>
                        <p className="text-sm text-muted-foreground">
                          Adicione vídeos tutoriais do YouTube para ajudar os membros a utilizar a ferramenta.
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addVideoTutorial}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Vídeo
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {videoTutorials.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum tutorial adicionado.</p>
                      )}
                      
                      {videoTutorials.map((tutorial, index) => (
                        <div key={index} className="grid gap-4 p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Tutorial #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeVideoTutorial(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid gap-4">
                            <div>
                              <FormLabel>Título do Vídeo</FormLabel>
                              <Input
                                value={tutorial.title}
                                onChange={(e) => updateVideoTutorial(index, 'title', e.target.value)}
                                placeholder="Ex: Como criar sua primeira automação"
                              />
                            </div>
                            
                            <div>
                              <FormLabel>URL do YouTube</FormLabel>
                              <Input
                                value={tutorial.url}
                                onChange={(e) => updateVideoTutorial(index, 'url', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                              />
                              <FormDescription>
                                Cole a URL completa do vídeo do YouTube.
                              </FormDescription>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4">
            <Link to="/admin/tools">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Ferramenta
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminToolEdit;
