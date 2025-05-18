
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReplyForm } from "@/components/community/ReplyForm";
import { 
  MessageSquare,
  ThumbsUp, 
  AlertTriangle, 
  MoreVertical, 
  Trash2 
} from "lucide-react";
import { Post, Profile } from "@/types/forumTypes";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { useQueryClient } from "@tanstack/react-query";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription,
  AlertDialogFooter, 
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface PostItemProps {
  post: Post;
  topicId: string;
  isTopicAuthor: boolean;
  isNestedReply?: boolean;
  isLocked?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onReplyAdded?: () => void;
}

export const PostItem = ({
  post,
  topicId,
  isTopicAuthor,
  isNestedReply = false,
  isLocked = false,
  isAdmin = false,
  currentUserId,
  onReplyAdded
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  // Verificar se o usuário atual pode excluir este post
  const canDelete = isAdmin || (currentUserId && post.user_id === currentUserId);
  
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onReplyAdded) onReplyAdded();
  };

  // Função para excluir o post
  const handleDeletePost = async () => {
    if (!post.id || !topicId) return;
    
    try {
      setIsDeleting(true);
      
      const { success, error } = await deleteForumPost(post.id, topicId);
      
      if (!success) {
        throw new Error(error || "Erro desconhecido ao excluir resposta");
      }
      
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      toast.success("Resposta excluída com sucesso");
      
      if (onReplyAdded) {
        onReplyAdded();
      }
    } catch (error: any) {
      console.error("Erro ao excluir resposta:", error);
      toast.error(`Erro ao excluir resposta: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <div className={`relative ${isNestedReply ? "ml-12 my-3" : "mb-6"}`}>
      {isNestedReply && (
        <div className="absolute left-[-24px] top-6 h-[calc(100%-24px)] w-0.5 bg-border"></div>
      )}
      
      <Card className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url || undefined} alt={post.profiles?.name || 'Usuário'} />
            <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{post.profiles?.name || "Usuário"}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
                
                {isTopicAuthor && post.profiles?.id === post.user_id && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Autor
                  </span>
                )}

                {post.profiles?.role === 'admin' && (
                  <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              {/* Dropdown menu para ações do post */}
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-500 hover:text-red-700 focus:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="mt-2 prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              {!isLocked && !isNestedReply && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}
              
              <Button variant="ghost" size="sm" className="text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Curtir
              </Button>
              
              <Button variant="ghost" size="sm" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Reportar
              </Button>
            </div>
            
            {showReplyForm && (
              <div className="mt-4">
                <ReplyForm 
                  topicId={topicId} 
                  parentId={post.id} 
                  onSuccess={handleReplySuccess}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder={`Respondendo para ${post.profiles?.name || "Usuário"}...`}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Respostas aninhadas */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-3">
          {post.replies.map((reply) => (
            <PostItem
              key={reply.id}
              post={reply}
              topicId={topicId}
              isTopicAuthor={isTopicAuthor}
              isNestedReply={true}
              isLocked={isLocked}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}

      {/* Diálogo de confirmação para excluir post */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
