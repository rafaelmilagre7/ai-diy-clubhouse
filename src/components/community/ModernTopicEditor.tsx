
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Bold, Italic, Link, Image, Eye, Save, Upload, 
  Type, List, ListOrdered, Quote, Code, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ModernTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
  initialData?: {
    title?: string;
    content?: string;
  };
  mode?: 'create' | 'edit';
  topicId?: string;
}

export const ModernTopicEditor = ({ 
  categoryId, 
  categorySlug, 
  onSuccess,
  initialData,
  mode = 'create',
  topicId
}: ModernTopicEditorProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-save com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        localStorage.setItem('topic-draft', JSON.stringify({ title, content, categoryId }));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, categoryId]);

  // Carregar rascunho salvo
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const saved = localStorage.getItem('topic-draft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.categoryId === categoryId) {
            setTitle(draft.title || '');
            setContent(draft.content || '');
          }
        } catch (error) {
          console.error('Erro ao carregar rascunho:', error);
        }
      }
    }
  }, [mode, initialData, categoryId]);

  const createTopicMutation = useMutation({
    mutationFn: async ({ title, content, categoryId }: { title: string; content: string; categoryId: string }) => {
      const { data, error } = await supabase
        .from('community_topics')
        .insert([{
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      localStorage.removeItem('topic-draft');
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
      toast({ title: "Tópico criado com sucesso!" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar tópico",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!topicId) throw new Error('ID do tópico não fornecido');
      
      const { data, error } = await supabase
        .from('community_topics')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast({ title: "Tópico atualizado com sucesso!" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar tópico",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, adicione um título ao seu tópico",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Conteúdo obrigatório", 
        description: "Por favor, adicione conteúdo ao seu tópico",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (mode === 'create') {
        if (!categoryId) {
          throw new Error('Categoria não selecionada');
        }
        await createTopicMutation.mutateAsync({ title, content, categoryId });
      } else {
        await updateTopicMutation.mutateAsync({ title, content });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 50MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);

      const imageMarkdown = `![${file.name}](${publicUrl})`;
      const textarea = textareaRef.current;
      
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      } else {
        setContent(prev => prev + '\n\n' + imageMarkdown);
      }

      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + selectedText + after;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }
    }, 0);
  };

  const isSubmitting = createTopicMutation.isPending || updateTopicMutation.isPending || isSaving;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Input
            placeholder="Digite o título do seu tópico..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            style={{ fontSize: '1.5rem', lineHeight: '2rem' }}
          />
        </div>

        {/* Editor com Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Editar
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Toolbar */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('**', '**')}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('*', '*')}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('[texto do link](', ')')}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('- ', '')}
                title="Lista"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('1. ', '')}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('> ', '')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('`', '`')}
                title="Código"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                disabled={isUploading}
                title="Inserir imagem"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="edit" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <Textarea
                  ref={textareaRef}
                  placeholder="Descreva seu tópico em detalhes... 

Dicas:
- Use **negrito** para destacar pontos importantes
- Adicione links com [texto](url)
- Crie listas com - ou 1.
- Cite com > no início da linha
- Adicione código com `código`"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0"
                  rows={20}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{title || 'Título do tópico'}</CardTitle>
              </CardHeader>
              <CardContent>
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhum conteúdo para visualizar. Volte para a aba "Editar" e adicione conteúdo.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {(title || content) && (
              <Badge variant="secondary" className="gap-1">
                <Save className="h-3 w-3" />
                Rascunho salvo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? 'Criar Tópico' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
