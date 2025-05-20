
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, MoreVertical, Loader2, Edit, Trash, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/forumTypes";
import { getInitials, getAvatarUrl } from "@/utils/user";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { incrementTopicReplies } from "@/lib/supabase/rpc";
import { useAuth } from "@/contexts/auth";

interface PostItemProps {
  post: Post;
  topicId: string;
  isTopicAuthor: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onReplyAdded?: () => void;
  topicAuthorId?: string;
}

export const PostItem = ({
  post,
  topicId,
  isTopicAuthor,
  isAdmin,
  currentUserId,
  onReplyAdded,
  topicAuthorId
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { user } = useAuth();
  
  const isPostAuthor = currentUserId === post.user_id;
  const canEditPost = isPostAuthor || isAdmin;
  const canDeletePost = isPostAuthor || isAdmin;

  const avatarUrl = post.profiles?.avatar_url 
    ? getAvatarUrl(post.profiles.avatar_url) 
    : undefined;
  const userName = post.profiles?.name || "Usuário";
  const userInitials = getInitials(userName);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error("O conteúdo da resposta não pode estar vazio");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para responder");
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log("Enviando resposta:", {
        content: replyContent,
        topicId: topicId,
        userId: user.id
      });
      
      // Inserir nova resposta
      const { data: newPost, error } = await supabase
        .from("forum_posts")
        .insert({
          content: replyContent,
          topic_id: topicId,
          user_id: user.id,
        })
        .select(`
          *,
          profiles:user_id(*)
        `)
        .single();
      
      if (error) {
        console.error("Erro ao enviar resposta:", error);
        toast.error("Falha ao enviar resposta. Por favor, tente novamente.");
        return;
      }
      
      console.log("Resposta enviada com sucesso:", newPost);
      
      // Incrementar contador de respostas no tópico
      await incrementTopicReplies(topicId);
      
      toast.success("Resposta enviada com sucesso!");
      setReplyContent("");
      setShowReplyForm(false);
      
      // Notificar o componente pai para atualizar a lista
      if (onReplyAdded) {
        onReplyAdded();
      }
      
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      toast.error("Ocorreu um erro ao processar sua resposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editContent.trim()) {
      toast.error("O conteúdo da resposta não pode estar vazio");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Atualizar post
      const { error } = await supabase
        .from("forum_posts")
        .update({
          content: editContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);
      
      if (error) {
        console.error("Erro ao atualizar resposta:", error);
        toast.error("Falha ao atualizar resposta. Por favor, tente novamente.");
        return;
      }
      
      toast.success("Resposta atualizada com sucesso!");
      setIsEditing(false);
      
      // Atualiza o post localmente
      post.content = editContent;
      post.updated_at = new Date().toISOString();
      
    } catch (error) {
      console.error("Erro ao processar atualização:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta resposta?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Deletar post
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", post.id);
      
      if (error) {
        console.error("Erro ao excluir resposta:", error);
        toast.error("Falha ao excluir resposta. Por favor, tente novamente.");
        return;
      }
      
      toast.success("Resposta excluída com sucesso!");
      
      // Decrementar contador de respostas no tópico e atualizar
      try {
        const { data } = await supabase
          .from('forum_topics')
          .select('reply_count')
          .eq('id', topicId)
          .single();

        if (data && data.reply_count > 0) {
          await supabase
            .from('forum_topics')
            .update({ 
              reply_count: data.reply_count - 1,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', topicId);
        }
      } catch (err) {
        console.error("Erro ao decrementar contador de respostas:", err);
      }
      
      // Notificar o componente pai para atualizar a lista
      if (onReplyAdded) {
        onReplyAdded();
      }
      
    } catch (error) {
      console.error("Erro ao processar exclusão:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{userName}</span>
                {post.profiles?.role === "admin" && (
                  <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Admin</span>
                )}
                {topicAuthorId === post.user_id && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Autor</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                {post.updated_at !== post.created_at && " (editado)"}
              </div>
            </div>

            {canEditPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditPost && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)} disabled={isEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                  )}
                  {canDeletePost && (
                    <DropdownMenuItem onClick={handleDeletePost} disabled={isDeleting} className="text-red-500 focus:text-red-500">
                      <Trash className="h-4 w-4 mr-2" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdatePost} className="mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full mb-2"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="mt-2 prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={!user}
                  className="text-xs"
                >
                  <Reply className="h-3.5 w-3.5 mr-1" />
                  Responder
                </Button>
              </div>
              
              {showReplyForm && (
                <form onSubmit={handleReply} className="mt-3">
                  <Textarea
                    placeholder="Escreva sua resposta..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full mb-2"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                      }}
                      disabled={submitting}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting} size="sm">
                      {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                      Enviar resposta
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
