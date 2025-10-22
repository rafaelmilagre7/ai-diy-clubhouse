
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Edit3, 
  Send, 
  Image as ImageIcon,
  Bold,
  Italic,
  Link,
  List,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { InlineImagePreview } from './InlineImagePreview';
import { DragDropImageZone } from './DragDropImageZone';
import { ImageEditDialog } from './ImageEditDialog';

interface ModernTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  topicId?: string;
  onSuccess?: () => void;
  mode: 'create' | 'edit';
}

interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
}

interface TopicData {
  id: string;
  title: string;
  content: string;
  category_id: string;
}

export const ModernTopicEditor: React.FC<ModernTopicEditorProps> = ({
  categoryId,
  categorySlug,
  topicId,
  onSuccess,
  mode
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [imageEditDialog, setImageEditDialog] = useState<{
    isOpen: boolean;
    imageUrl: string;
    altText: string;
    markdownText: string;
  }>({
    isOpen: false,
    imageUrl: '',
    altText: '',
    markdownText: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as CommunityCategory[];
    }
  });

  // Buscar dados do tópico se estivermos editando
  const { data: topicData } = useQuery({
    queryKey: ['community-topic', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      
      const { data, error } = await supabase
        .from('community_topics')
        .select('id, title, content, category_id')
        .eq('id', topicId)
        .single();
      
      if (error) throw error;
      return data as TopicData;
    },
    enabled: mode === 'edit' && !!topicId
  });

  // Carregar dados do tópico
  useEffect(() => {
    if (topicData) {
      setTitle(topicData.title);
      setContent(topicData.content);
      setSelectedCategoryId(topicData.category_id);
    }
  }, [topicData]);

  // Extrair imagens do markdown
  const imageMatches = useMemo(() => {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        altText: match[1],
        url: match[2],
        index: match.index
      });
    }
    
    return matches;
  }, [content]);

  // Função para inserir markdown no textarea
  const insertMarkdown = useCallback((markdownText: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;
    
    const newContent = currentContent.substring(0, start) + markdownText + currentContent.substring(end);
    setContent(newContent);
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdownText.length, start + markdownText.length);
    }, 0);
  }, [content]);

  // Toolbar actions
  const toolbarActions = [
    {
      icon: Bold,
      label: 'Negrito',
      action: () => insertMarkdown('**texto em negrito**')
    },
    {
      icon: Italic,
      label: 'Itálico',
      action: () => insertMarkdown('*texto em itálico*')
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[texto do link](https://exemplo.com)')
    },
    {
      icon: List,
      label: 'Lista',
      action: () => insertMarkdown('\n- Item da lista\n- Outro item\n')
    }
  ];

  // Handle image upload
  const handleImageUpload = useCallback((url: string, fileName: string) => {
    const markdownImage = `![${fileName}](${url})`;
    insertMarkdown(`\n\n${markdownImage}\n\n`);
    
    toast({
      title: 'Imagem adicionada',
      description: `${fileName} foi inserida no tópico.`
    });
  }, [insertMarkdown, toast]);

  // Handle image edit
  const handleImageEdit = useCallback((imageMatch: typeof imageMatches[0]) => {
    setImageEditDialog({
      isOpen: true,
      imageUrl: imageMatch.url,
      altText: imageMatch.altText,
      markdownText: imageMatch.fullMatch
    });
  }, []);

  // Handle image remove
  const handleImageRemove = useCallback((imageMatch: typeof imageMatches[0]) => {
    const newContent = content.replace(imageMatch.fullMatch, '');
    setContent(newContent);
    
    toast({
      title: 'Imagem removida',
      description: 'A imagem foi removida do tópico.'
    });
  }, [content, toast]);

  // Save image edit
  const handleSaveImageEdit = useCallback((newAltText: string) => {
    const oldMarkdown = imageEditDialog.markdownText;
    const newMarkdown = `![${newAltText}](${imageEditDialog.imageUrl})`;
    const newContent = content.replace(oldMarkdown, newMarkdown);
    setContent(newContent);
    
    toast({
      title: 'Imagem atualizada',
      description: 'O texto alternativo foi atualizado.'
    });
  }, [content, imageEditDialog, toast]);

  // Mutation para criar tópico
  const createTopicMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category_id: string }) => {
      const { data: topic, error } = await supabase
        .from('community_topics')
        .insert([{
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return topic;
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
      
      toast({
        title: 'Tópico criado!',
        description: 'Seu tópico foi publicado com sucesso.'
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/comunidade/topico/${topic.id}`);
      }
    },
    onError: (error) => {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: 'Erro ao criar tópico',
        description: 'Ocorreu um erro ao publicar seu tópico. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Validation
  const isValid = title.trim().length >= 5 && content.trim().length >= 10 && selectedCategoryId;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos corretamente.',
        variant: 'destructive'
      });
      return;
    }

    createTopicMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category_id: selectedCategoryId
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-save status */}
      {autoSaveStatus && (
        <div className="flex items-center justify-end gap-2 text-sm">
          {autoSaveStatus === 'saving' && (
            <>
              <Clock className="h-4 w-4 animate-spin text-operational" />
              <span className="text-operational">Salvando...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <div className="h-2 w-2 bg-success rounded-full" />
              <span className="text-success">Salvo</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Erro ao salvar</span>
            </>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">
            Título do Tópico *
            <span className="text-sm text-muted-foreground font-normal ml-2">
              ({title.length}/100)
            </span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="Digite um título claro e descritivo para seu tópico"
            maxLength={100}
            required
            className={`h-12 text-base ${title.length > 80 ? 'border-warning' : ''}`}
          />
          {title.length < 5 && title.length > 0 && (
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              O título deve ter pelo menos 5 caracteres
            </p>
          )}
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Categoria *</Label>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="h-12 text-base bg-background/50">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
              {categories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                  className="cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Editor com Tabs */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Conteúdo *
            <span className="text-sm text-muted-foreground font-normal ml-2">
              ({content.length} caracteres)
            </span>
          </Label>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              {/* Toolbar - só mostra na aba Edit */}
              {activeTab === 'edit' && (
                <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-background/50">
                  {toolbarActions.map((action, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={action.action}
                      title={action.label}
                      className="h-8 w-8 p-0"
                    >
                      <action.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <TabsContent value="edit" className="space-y-4 mt-0">
              {/* Upload de Imagem */}
              <DragDropImageZone 
                onImageUpload={handleImageUpload}
                disabled={createTopicMutation.isPending}
                className="mb-4"
              />
              
              {/* Textarea */}
              <Textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do seu tópico... 

Você pode usar Markdown:
- **negrito** ou *itálico*
- [links](https://exemplo.com)
- Listas com - ou 1.
- Arraste imagens aqui ou use o botão acima"
                className="min-h-[400px] resize-none text-base bg-background/50"
                required
              />
              
              {/* Preview inline das imagens */}
              {imageMatches.length > 0 && (
                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Imagens no tópico</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {imageMatches.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageMatches.map((imageMatch, index) => (
                      <InlineImagePreview
                        key={`${imageMatch.url}-${index}`}
                        src={imageMatch.url}
                        alt={imageMatch.altText}
                        onEdit={() => handleImageEdit(imageMatch)}
                        onRemove={() => handleImageRemove(imageMatch)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[400px] p-6 rounded-lg bg-background/50 border border-border/50">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <div className="text-muted-foreground text-center py-12">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Digite algum conteúdo para ver o preview</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {content.length < 10 && content.length > 0 && (
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              O conteúdo deve ter pelo menos 10 caracteres
            </p>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="text-sm">
            {!isValid && (
              <span className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Preencha todos os campos obrigatórios
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={!isValid || createTopicMutation.isPending}
              className="min-w-[180px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {createTopicMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Tópico
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Dialog de edição de imagem */}
      <ImageEditDialog
        isOpen={imageEditDialog.isOpen}
        onClose={() => setImageEditDialog(prev => ({ ...prev, isOpen: false }))}
        imageUrl={imageEditDialog.imageUrl}
        currentAlt={imageEditDialog.altText}
        onSave={handleSaveImageEdit}
      />
    </div>
  );
};
