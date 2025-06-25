
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useSolutionComments } from "@/hooks/implementation/useSolutionComments";
import { CommentForm } from "@/components/implementation/content/tool-comments/CommentForm";
import { CommentList } from "@/components/implementation/content/tool-comments/CommentList";

interface CommentsTabProps {
  solution: Solution;
}

export const CommentsTab = ({ solution }: CommentsTabProps) => {
  const {
    comments,
    isLoading,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    setReplyTo,
    likeComment,
    deleteComment
  } = useSolutionComments(solution.id, "general");

  const startReply = (commentObj: any) => {
    setReplyTo(commentObj);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <MessageSquare className="h-5 w-5 text-viverblue" />
            Discussão da Solução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-neutral-400">
            Compartilhe suas experiências, dúvidas ou dicas sobre esta solução com outros membros.
          </p>
          
          <CommentForm
            comment={comment}
            setComment={setComment}
            replyTo={replyTo}
            cancelReply={cancelReply}
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
          
          <CommentList
            comments={comments}
            isLoading={isLoading}
            onReply={startReply}
            onLike={likeComment}
            onDelete={deleteComment}
          />
        </CardContent>
      </Card>
    </div>
  );
};
