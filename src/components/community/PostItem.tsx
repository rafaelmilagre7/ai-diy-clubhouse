
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReplyForm } from "@/components/community/ReplyForm";
import { MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  is_solution: boolean;
  profiles: Profile;
  replies?: Post[];
}

interface PostItemProps {
  post: Post;
  topicId: string;
  isTopicAuthor: boolean;
  isNestedReply?: boolean;
  isLocked?: boolean;
  onReplyAdded?: () => void;
}

export const PostItem = ({
  post,
  topicId,
  isTopicAuthor,
  isNestedReply = false,
  isLocked = false,
  onReplyAdded
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
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
            <div className="flex flex-wrap items-center gap-2 mb-1">
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
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
