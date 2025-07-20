
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { Post } from "@/types/forumTypes";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { SolutionBadge } from "./SolutionBadge";
import { usePostItem } from "@/hooks/community/usePostItem";

export interface PostItemProps {
  post: Post;
  onSuccess?: () => void;
}

export const PostItem = ({ post, onSuccess }: PostItemProps) => {
  const {
    isOwner,
    isSolutionPost,
    isSubmitting,
    handleMarkAsSolution,
    handleUnmarkAsSolution,
    handleDeletePost
  } = usePostItem({ post, topicId: post.topic_id, onSuccess });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="p-4 border rounded-lg bg-card relative">
      {/* Badge de Solução */}
      {isSolutionPost && <SolutionBadge />}
      
      {/* Header do Post */}
      <PostHeader post={post} />
      
      {/* Conteúdo */}
      <div className="mt-4">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>
      </div>

      {/* Footer com ações */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formatDate(post.created_at)}
        </div>
        
        <PostActions
          post={post}
          isOwner={isOwner}
          isSolutionPost={isSolutionPost}
          isSubmitting={isSubmitting}
          onMarkSolution={handleMarkAsSolution}
          onUnmarkSolution={handleUnmarkAsSolution}
          onDelete={handleDeletePost}
        />
      </div>
    </div>
  );
};
