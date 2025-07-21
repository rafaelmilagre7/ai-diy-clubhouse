import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface RichTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

export const RichTopicEditor = ({ categoryId, categorySlug, onSuccess }: RichTopicEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
  });

  const createTopicMutation = useMutation({
    mutationFn: async ({ title, content, categoryId }: { title: string; content: string; categoryId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_topics')
        .insert({
          title,
          content,
          category_id: categoryId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
      toast({
        title: 'Tópico criado!',
        description: 'Seu tópico foi publicado com sucesso.',
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: 'Erro ao criar tópico',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    // Validações de arquivo
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 50MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Use apenas PNG, JPEG, GIF ou WebP.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const timestamp = new Date().getTime();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedFileName}`;
      const filePath = `community/${fileName}`;

      console.log('Fazendo upload para community-images bucket:', filePath);

      const { data, error } = await supabase.storage
        .from('community-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', publicUrl);

      // Inserir markdown da imagem no conteúdo
      const imageMarkdown = `![Imagem](${publicUrl})`;
      
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);
        
        // Posicionar cursor após a imagem inserida
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      } else {
        setContent(prev => prev + '\n' + imageMarkdown);
      }

      toast({
        title: 'Imagem enviada!',
        description: 'A imagem foi adicionada ao seu tópico.',
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      
      let errorMessage = 'Erro ao enviar a imagem, tente novamente.';
      if (error.message?.includes('not found')) {
        errorMessage = 'Bucket de imagens não encontrado. Contate o suporte.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Sem permissão para enviar imagens. Faça login novamente.';
      }
      
      toast({
        title: 'Erro no upload',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Limpar o input para permitir reusar o mesmo arquivo
    event.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título, conteúdo e selecione uma categoria.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTopicMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        categoryId: selectedCategoryId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Tópico</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título do Tópico *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do seu tópico..."
                className="w-full"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 caracteres
              </p>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Categoria *
              </label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editor de Conteúdo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="text-sm font-medium">
                  Conteúdo *
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        Adicionar Imagem
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </div>
              <Textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do seu tópico... Você pode usar Markdown para formatação."
                className="min-h-[200px] resize-y"
                maxLength={10000}
              />
              <p className="text-xs text-muted-foreground">
                {content.length}/10000 caracteres • Suporte a Markdown
              </p>
            </div>

            {/* Preview */}
            {content.trim() && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || !title.trim() || !content.trim() || !selectedCategoryId}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publicar Tópico
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
