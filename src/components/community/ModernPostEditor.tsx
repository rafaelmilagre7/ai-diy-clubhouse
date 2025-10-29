
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, Link, Image, Eye, Type,
  List, ListOrdered, Quote, Code, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { 
  showModernError, 
  showModernLoading, 
  showModernSuccessWithAction,
  showModernSuccess,
  dismissModernToast 
} from "@/lib/toast-helpers";

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
  
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      console.log('🚀 [COMMENT] Iniciando envio de comentário...');
      
      if (!topicId) {
        console.error('❌ [COMMENT] topicId não fornecido');
        throw new Error('ID do tópico não fornecido');
      }
      
      // 1️⃣ VALIDAR SESSÃO PRIMEIRO
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 [COMMENT] Verificação de sessão:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        hasAccessToken: !!session?.access_token
      });
      
      if (sessionError || !session) {
        console.error('❌ [COMMENT] Sessão inválida:', sessionError);
        throw new Error('Sua sessão expirou. Faça login novamente.');
      }
      
      // 2️⃣ RENOVAR SESSÃO SE ESTIVER PRÓXIMA DE EXPIRAR
      const expiresAt = new Date(session.expires_at || 0).getTime();
      const now = Date.now();
      const timeToExpire = expiresAt - now;
      
      if (timeToExpire < 5 * 60 * 1000) {
        console.log('⚠️ [COMMENT] Sessão próxima de expirar, renovando...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('❌ [COMMENT] Erro ao renovar sessão:', refreshError);
          throw new Error('Não foi possível renovar sua sessão. Faça login novamente.');
        }
        
        console.log('✅ [COMMENT] Sessão renovada com sucesso');
      }
      
      // 3️⃣ PEGAR USUÁRIO
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('👤 [COMMENT] Usuário:', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message
      });
      
      if (authError || !user?.id) {
        console.error('❌ [COMMENT] Erro de autenticação:', authError);
        throw new Error('Você precisa estar logado para enviar uma resposta');
      }
      
      console.log('📝 [COMMENT] Tentando inserir post direto...');
      
      // 4️⃣ TENTAR INSERT DIRETO
      let data, error;
      
      try {
        const insertResult = await supabase
          .from('community_posts')
          .insert([{
            content: content.trim(),
            topic_id: topicId,
            user_id: user.id
          }])
          .select()
          .single();
        
        data = insertResult.data;
        error = insertResult.error;
        
        console.log('📊 [COMMENT] Resultado do insert direto:', {
          hasData: !!data,
          hasError: !!error,
          errorMessage: error?.message,
          errorDetails: error?.details,
          errorHint: error?.hint,
          errorCode: error?.code
        });
      } catch (insertError: any) {
        console.error('❌ [COMMENT] Exceção no insert direto:', insertError);
        error = insertError;
      }
      
      // 5️⃣ SE FALHOU, TENTAR VIA RPC
      if (error) {
        console.warn('⚠️ [COMMENT] Insert direto falhou, tentando via RPC...', error);
        
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_community_post_secure', {
              p_topic_id: topicId,
              p_content: content.trim()
            });
          
          console.log('📊 [COMMENT] Resultado do RPC:', {
            hasData: !!rpcData,
            hasError: !!rpcError,
            errorMessage: rpcError?.message
          });
          
          if (rpcError) {
            console.error('❌ [COMMENT] RPC também falhou:', rpcError);
            throw rpcError;
          }
          
          data = rpcData;
          console.log('✅ [COMMENT] Post criado via RPC com sucesso!');
        } catch (rpcError: any) {
          console.error('❌ [COMMENT] Erro crítico no RPC:', rpcError);
          throw rpcError;
        }
      } else {
        console.log('✅ [COMMENT] Post criado via insert direto com sucesso!');
      }
      
      if (!data) {
        console.error('❌ [COMMENT] Nenhum dado retornado após insert/RPC');
        throw new Error('Erro ao criar post: nenhum dado retornado');
      }
      
      // Incrementar contador de respostas
      try {
        await supabase.rpc('increment_topic_replies', { topic_id: topicId });
      } catch (rpcError) {
        console.error('Erro ao incrementar contador:', rpcError);
      }

      // Criar notificação
      try {
        const { data: topicData } = await supabase
          .from("community_topics")
          .select("user_id, title")
          .eq("id", topicId)
          .single();

        if (topicData && topicData.user_id !== user.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          const contentPreview = content.trim().substring(0, 100);
          
          await supabase
            .from("notifications")
            .insert({
              user_id: topicData.user_id,
              actor_id: user.id,
              type: "community_reply",
              title: `${profile?.name || "Alguém"} respondeu seu tópico`,
              message: `"${contentPreview}${content.trim().length > 100 ? "..." : ""}"`,
              action_url: `/comunidade/topico/${topicId}#post-${data.id}`,
              category: "community",
              priority: 2
            });
        }
      } catch (notifError) {
        console.error('Erro ao criar notificação:', notifError);
      }
      
      return data;
    },
    onSuccess: (data) => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      
      showModernSuccessWithAction(
        "Resposta enviada!",
        "Seu comentário foi publicado com sucesso",
        {
          label: "Ver resposta",
          onClick: () => {
            const postElement = document.querySelector(`[data-post-id="${data?.id}"]`);
            if (postElement) {
              postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      showModernError(
        "Erro ao enviar resposta",
        error.message || "Não foi possível publicar. Tente novamente."
      );
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
      showModernSuccess(
        "Resposta atualizada!",
        "Suas alterações foram salvas com sucesso"
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      showModernError(
        "Erro ao atualizar",
        error.message || "Não foi possível salvar as alterações"
      );
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 [COMMENT] handleSubmit chamado', { mode, hasContent: !!content.trim() });
    
    if (!content.trim()) {
      showModernError(
        "Conteúdo obrigatório",
        "Por favor, escreva sua resposta antes de enviar"
      );
      return;
    }

    // ✅ VERIFICAR SESSÃO ANTES DE SUBMETER
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 [COMMENT] Validação de sessão no submit:', {
        hasSession: !!session,
        sessionError: sessionError?.message
      });
      
      if (sessionError || !session) {
        console.error('❌ [COMMENT] Sessão inválida no submit:', sessionError);
        showModernError(
          "Sessão expirada",
          "Por favor, faça login novamente para continuar"
        );
        
        // Redirecionar para login
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }, 2000);
        return;
      }
      
      console.log('✅ [COMMENT] Sessão válida, prosseguindo com mutation...');

      if (mode === 'create') {
        createPostMutation.mutate(content);
      } else {
        updatePostMutation.mutate(content);
      }
    } catch (error: any) {
      console.error('❌ [COMMENT] Erro ao validar sessão no submit:', error);
      showModernError(
        "Erro de autenticação",
        "Não foi possível validar sua sessão. Tente fazer login novamente."
      );
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showModernError(
        "Arquivo inválido",
        "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, etc.)"
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showModernError(
        "Arquivo muito grande",
        "O arquivo deve ter no máximo 50MB. Tente reduzir o tamanho da imagem."
      );
      return;
    }

    const uploadId = showModernLoading(
      "Enviando imagem...",
      "Fazendo upload da imagem para o servidor"
    );
    
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

      dismissModernToast(uploadId);
      showModernSuccess(
        "Imagem adicionada!",
        "A imagem foi inserida no seu comentário"
      );
    } catch (error: any) {
      console.error('Erro no upload:', error);
      dismissModernToast(uploadId);
      showModernError(
        "Erro no upload",
        error.message || "Não foi possível enviar a imagem. Tente novamente."
      );
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
            disabled={createPostMutation.isPending || updatePostMutation.isPending || !content.trim()}
            className="min-w-button"
          >
            {(createPostMutation.isPending || updatePostMutation.isPending) ? (
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
