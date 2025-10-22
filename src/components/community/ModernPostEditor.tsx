
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, Link, Image, Eye, Type,
  List, ListOrdered, Quote, Code, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ModernPostEditorProps {
  topicId: string;
  onSuccess?: () => void;
  placeholder?: string;
  initialContent?: string;
  mode?: 'create' | 'edit';
  postId?: string;
}

export const ModernPostEditor = ({ 
  topicId, 
  onSuccess,
  placeholder = "Escreva sua resposta...",
  initialContent = "",
  mode = 'create',
  postId
}: ModernPostEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          content: content.trim(),
          topic_id: topicId,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Incrementar contador de respostas
      await supabase.rpc('increment_topic_replies', { topic_id: topicId });

      // 📢 Criar notificação para o autor do tópico (se não for o próprio usuário)
      if (data && userId) {
        const { data: topicData } = await supabase
          .from("community_topics")
          .select("user_id, title")
          .eq("id", topicId)
          .single();

        if (topicData && topicData.user_id !== userId) {
          // Buscar nome do usuário que respondeu
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", userId)
            .single();

          const contentPreview = content.trim().substring(0, 100);
          
          await supabase
            .from("notifications")
            .insert({
              user_id: topicData.user_id,
              type: "community_reply",
              title: `${profile?.name || "Alguém"} respondeu seu tópico`,
              message: `"${contentPreview}${content.trim().length > 100 ? "..." : ""}"`,
              action_url: `/comunidade/topico/${topicId}#post-${data.id}`,
              category: "community",
              priority: 2
            });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      toast({ title: "Resposta enviada com sucesso!" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!postId) throw new Error('ID do post não fornecido');
      
      const { data, error } = await supabase
        .from('community_posts')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      toast({ title: "Resposta atualizada com sucesso!" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar resposta",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Por favor, escreva sua resposta",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'create') {
      await createPostMutation.mutateAsync(content);
    } else {
      await updatePostMutation.mutateAsync(content);
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

  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Editor com Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <div className="flex items-center justify-between mb-3">
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

            {/* Toolbar compacta */}
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
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-52 resize-none border-none shadow-none focus-visible:ring-0"
                rows={8}
              />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <Card>
              <CardContent className="p-4">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhum conteúdo para visualizar.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="min-w-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {mode === 'create' ? 'Enviando...' : 'Salvando...'}
              </>
            ) : (
              <>
                {mode === 'create' ? 'Enviar Resposta' : 'Salvar Alterações'}
              </>
            )}
          </Button>
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
