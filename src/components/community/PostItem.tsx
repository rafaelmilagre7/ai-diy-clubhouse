
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ReplyForm } from "@/components/community/ReplyForm";
import { Post } from "@/types/forumTypes";
import { PostActions } from "./PostActions";
import { PostContextMenu } from "./PostContextMenu";
import { PostHeader } from "./PostHeader";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { getInitials } from "@/utils/user";
import { useTopicSolution } from "@/hooks/community/useTopicSolution";

interface PostItemProps {
  post: Post;
  topicId: string;
  isTopicAuthor: boolean;
  isNestedReply?: boolean;
  isLocked?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onReplyAdded?: () => void;
  topicAuthorId?: string;
}

export const PostItem = ({
  post,
  topicId,
  isTopicAuthor,
  isNestedReply = false,
  isLocked = false,
  isAdmin = false,
  currentUserId,
  onReplyAdded,
  topicAuthorId
}: PostItemProps) => {
  // Verificar se o usuário atual pode excluir este post
  const canDelete = isAdmin || (currentUserId && post.user_id === currentUserId);
  
  const {
    showReplyForm,
    showDeleteDialog,
    isDeleting,
    toggleReplyForm,
    openDeleteDialog,
    closeDeleteDialog,
    handleReplySuccess,
    handleDeletePost
  } = usePostInteractions({
    post,
    topicId,
    onReplyAdded
  });
  
  // Hook para gerenciar marcação de soluções
  const {
    isSubmitting: isSubmittingSolution,
    markAsSolved,
    unmarkAsSolved
  } = useTopicSolution({
    topicId,
    topicAuthorId: topicAuthorId || '',
    initialSolvedState: false
  });

  // Manipuladores para marcar/desmarcar como solução
  const handleMarkAsSolution = async () => {
    await markAsSolved(post.id);
  };

  const handleUnmarkAsSolution = async () => {
    await unmarkAsSolved();
  };
  
  // Renderização dos posts aninhados (respostas a respostas)
  const renderNestedReplies = () => {
    if (!post.replies || post.replies.length === 0) return null;
    
    return (
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
            topicAuthorId={topicAuthorId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${isNestedReply ? "ml-12 my-3" : "mb-6"}`}>
      {isNestedReply && (
        <div className="absolute left-[-24px] top-6 h-[calc(100%-24px)] w-0.5 bg-border"></div>
      )}
      
      <Card className={`p-4 ${post.is_solution ? "border-green-500 border-2" : ""}`}>
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url || undefined} alt={post.profiles?.name || 'Usuário'} />
            <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <PostHeader
              profile={post.profiles}
              createdAt={post.created_at}
              isTopicAuthor={isTopicAuthor}
              userId={post.user_id}
              isAdmin={isAdmin}
              contextMenu={canDelete ? <PostContextMenu onDeleteClick={openDeleteDialog} /> : undefined}
              isSolution={post.is_solution}
            />
            
            <div className="mt-2 prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <PostActions
              postId={post.id}
              isOwner={currentUserId === post.user_id}
              isAdmin={isAdmin}
              isReply={true}
              onReply={toggleReplyForm}
              canMarkAsSolved={(isTopicAuthor || isAdmin) && !isNestedReply}
              isSolutionPost={post.is_solution}
              isSubmitting={isSubmittingSolution}
              onMarkAsSolved={handleMarkAsSolution}
              onUnmarkAsSolved={handleUnmarkAsSolution}
              onDelete={openDeleteDialog}
            />
            
            {showReplyForm && (
              <div className="mt-4">
                <ReplyForm 
                  topicId={topicId} 
                  parentId={post.id} 
                  onSuccess={handleReplySuccess}
                  onCancel={toggleReplyForm}
                  placeholder={`Respondendo para ${post.profiles?.name || "Usuário"}...`}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {renderNestedReplies()}

      <DeleteConfirmationDialog 
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onDelete={handleDeletePost}
        isDeleting={isDeleting}
      />
    </div>
  );
};
