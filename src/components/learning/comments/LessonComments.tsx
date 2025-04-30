
import React, { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { useLessonComments } from "@/hooks/learning/useLessonComments";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { 
    comments, 
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting
  } = useLessonComments(lessonId);
  
  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    await addComment(content, parentId);
  };
  
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };
  
  const handleLikeComment = async (commentId: string) => {
    await likeComment(commentId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Discussão</h2>
      </div>
      
      <Card className="p-4">
        <CommentForm 
          lessonId={lessonId}
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
      </Card>
      
      <Separator />
      
      <CommentList
        comments={comments}
        lessonId={lessonId}
        onReply={handleSubmitComment}
        onDelete={handleDeleteComment}
        onLike={handleLikeComment}
        isLoading={isLoading}
      />
    </div>
  );
};
