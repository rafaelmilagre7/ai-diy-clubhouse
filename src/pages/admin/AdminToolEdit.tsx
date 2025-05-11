
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { MemberBenefit } from '@/components/admin/tools/components/MemberBenefit';
import { useForm } from 'react-hook-form';
import { ToolFormValues } from '@/components/admin/tools/types/toolFormTypes';
import { LogoUpload } from '@/components/admin/tools/components/LogoUpload';
import { BenefitAccessControl } from '@/components/admin/tools/BenefitAccessControl';

const AdminToolEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accessControlOpen, setAccessControlOpen] = useState(false);
  
  const form = useForm<ToolFormValues>({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      official_url: '',
      logo_url: '',
      tags: [],
      status: true,
      has_member_benefit: false,
      benefit_title: '',
      benefit_description: '',
      benefit_link: '',
      benefit_type: '',
      formModified: false
    }
  });
  
  const watchHasBenefit = form.watch('has_member_benefit');
  const watchFormModified = form.watch('formModified');

  // Recuperar dados da ferramenta se for edição
  useEffect(() => {
    if (id) {
      fetchTool(id);
    }
  }, [id]);

  const fetchTool = async (toolId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;
      
      // Preencher formulário com dados existentes
      form.reset({
        ...data,
        tags: data.tags || [],
        formModified: false
      });
    } catch (error) {
      console.error('Erro ao carregar ferramenta:', error);
      toast.error('Erro ao carregar dados da ferramenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: ToolFormValues) => {
    setIsSaving(true);
    try {
      // Filtrar apenas os campos necessários para a ferramenta
      const toolData = {
        name: values.name,
        description: values.description,
        category: values.category,
        official_url: values.official_url,
        logo_url: values.logo_url,
        tags: values.tags || [],
        status: values.status,
        has_member_benefit: values.has_member_benefit,
        benefit_title: values.benefit_title,
        benefit_description: values.benefit_description,
        benefit_link: values.benefit_link,
        benefit_badge_url: values.benefit_badge_url,
        benefit_type: values.benefit_type
      };
      
      if (id) {
        // Atualização
        const { error } = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Ferramenta atualizada com sucesso!');
      } else {
        // Nova ferramenta
        const { data, error } = await supabase
          .from('tools')
          .insert([toolData])
          .select();

        if (error) throw error;
        toast.success('Ferramenta criada com sucesso!');
        
        // Navegar para a edição da nova ferramenta
        if (data && data[0]) {
          navigate(`/admin/tools/${data[0].id}`);
        } else {
          navigate('/admin/tools');
        }
      }
      
      // Resetar flag de modificação
      form.setValue('formModified', false);
    } catch (error) {
      console.error('Erro ao salvar ferramenta:', error);
      toast.error('Erro ao salvar ferramenta');
    } finally {
      setIsSaving(false);
    }
  };

  // Manipular as etiquetas (tags)
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
      
    form.setValue('tags', tagsArray);
    form.setValue('formModified', true);
  };

  // Converter array de tags para string (para exibição no input)
  const tagsArrayToString = (tags?: string[]) => {
    return tags && tags.length > 0 ? tags.join(', ') : '';
  };

  // Manipulador para abrir o modal de controle de acesso
  const handleOpenAccessControl = () => {
    if (!id) {
      toast.error('Salve a ferramenta primeiro para gerenciar acesso');
      return;
    }
    setAccessControlOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/tools')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {id ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {watchHasBenefit && id && (
            <Button 
              onClick={handleOpenAccessControl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Gerenciar Acesso</span>
              <span className="sm:hidden">Acesso</span>
            </Button>
          )}
          
          <Button 
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSaving || isLoading || !watchFormModified}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Ferramenta *</Label>
                  <Input
                    id="name"
                    placeholder="Nome da ferramenta"
                    {...form.register('name')}
                    onChange={(e) => {
                      form.register('name').onChange(e);
                      form.setValue('formModified', true);
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição da ferramenta"
                    className="min-h-[120px]"
                    {...form.register('description')}
                    onChange={(e) => {
                      form.register('description').onChange(e);
                      form.setValue('formModified', true);
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={form.watch('category')}
                    onValueChange={(value) => {
                      form.setValue('category', value);
                      form.setValue('formModified', true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produtividade">Produtividade</SelectItem>
                      <SelectItem value="conteúdo">Conteúdo</SelectItem>
                      <SelectItem value="imagens">Imagens</SelectItem>
                      <SelectItem value="vídeo">Vídeo</SelectItem>
                      <SelectItem value="áudio">Áudio</SelectItem>
                      <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="negócios">Negócios</SelectItem>
                      <SelectItem value="educação">Educação</SelectItem>
                      <SelectItem value="pesquisa">Pesquisa</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="official_url">URL Oficial *</Label>
                  <Input
                    id="official_url"
                    placeholder="https://exemplo.com"
                    type="url"
                    {...form.register('official_url')}
                    onChange={(e) => {
                      form.register('official_url').onChange(e);
                      form.setValue('formModified', true);
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="ia, texto, assistente"
                    value={tagsArrayToString(form.watch('tags'))}
                    onChange={handleTagsChange}
                  />
                </div>

                <LogoUpload
                  value={form.watch('logo_url')}
                  onChange={(url) => {
                    form.setValue('logo_url', url);
                    form.setValue('formModified', true);
                  }}
                />
              </CardContent>
            </Card>
            
            {/* Componente de Benefício para Membros */}
            <MemberBenefit 
              form={form}
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
                      {form.watch('logo_url') ? (
                        <img 
                          src={form.watch('logo_url')} 
                          alt="Logo" 
                          className="h-full w-full object-contain" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#0ABAB5]">
                          {form.watch('name')?.substring(0, 2).toUpperCase() || 'AI'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {form.watch('name') || 'Nome da Ferramenta'}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#0ABAB5]/10 text-[#0ABAB5]">
                        {form.watch('category') || 'Categoria'}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {form.watch('description') || 'Descrição da ferramenta...'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {form.watch('tags')?.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {watchHasBenefit && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização do Benefício</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {form.watch('benefit_title') || 'Título do Benefício'}
                      </h3>
                      {form.watch('benefit_type') && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#10b981]/10 text-[#10b981]">
                          {form.watch('benefit_type') === 'discount' ? 'Desconto' : 
                           form.watch('benefit_type') === 'exclusive' ? 'Exclusivo' :
                           form.watch('benefit_type') === 'free' ? 'Versão Gratuita' :
                           form.watch('benefit_type') === 'trial' ? 'Trial Estendido' : 'Outro'}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 whitespace-pre-line">
                      {form.watch('benefit_description') || 'Descrição do benefício...'}
                    </p>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="bg-[#10b981] hover:bg-[#10b981]/90"
                        disabled
                      >
                        Acessar Benefício
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {/* Modal de Controle de Acesso */}
      {id && (
        <BenefitAccessControl
          open={accessControlOpen}
          onOpenChange={setAccessControlOpen}
          tool={form.watch() as Tool}
        />
      )}
    </div>
  );
};

export default AdminToolEdit;
