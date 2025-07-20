import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Shell } from "@/components/Shell";
import { ReplyForm } from "@/components/community/ReplyForm";
import {
  MessageSquare,
  ThumbsUp,
  MoreVertical,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pin,
  Lock,
  Flag,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { PostItem } from "@/components/community/PostItem";
import { Post, Topic } from "@/types/forumTypes";

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isTopicOwner, setIsTopicOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError,
  } = useQuery({
    queryKey: ["forumTopic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_topics")
        .select(
          `
          *,
          profiles(
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("id", topicId)
        .single();

      if (error) throw error;
      return data as Topic;
    },
    enabled: !!topicId,
  });

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["forumPosts", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select(
          `
          *,
          profiles(
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId,
  });

  useEffect(() => {
    if (topic && user) {
      setIsTopicOwner(topic.user_id === user.id);
      setIsAdmin(user?.user_metadata?.role === "admin");
    }
  }, [topic, user]);

  const handleReplyToPost = (postId: string) => {
    setReplyingTo(postId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handlePostSuccess = () => {
    setReplyingTo(null);
    refetchPosts();
  };

  const handleMarkAsSolution = async (postId: string) => {
    if (!user?.id) return;

    try {
      // Remover solução anterior se existir
      await supabase
        .from("forum_posts")
        .update({ is_accepted_solution: false })
        .eq("topic_id", topicId)
        .eq("is_accepted_solution", true);

      // Marcar novo post como solução
      await supabase
        .from("forum_posts")
        .update({ is_accepted_solution: true })
        .eq("id", postId);

      // Marcar tópico como resolvido
      await supabase
        .from("forum_topics")
        .update({ is_solved: true })
        .eq("id", topicId);

      toast.success("Post marcado como solução!");
      queryClient.invalidateQueries({ queryKey: ["forumTopic", topicId] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts", topicId] });
    } catch (error: any) {
      console.error("Erro ao marcar como solução:", error);
      toast.error("Erro ao marcar como solução");
    }
  };

  const handleUnmarkAsSolution = async (postId: string) => {
    if (!user?.id) return;

    try {
      // Remover como solução
      await supabase
        .from("forum_posts")
        .update({ is_accepted_solution: false })
        .eq("id", postId);

      // Desmarcar tópico como resolvido
      await supabase
        .from("forum_topics")
        .update({ is_solved: false })
        .eq("id", topicId);

      toast.success("Solução removida!");
      queryClient.invalidateQueries({ queryKey: ["forumTopic", topicId] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts", topicId] });
    } catch (error: any) {
      console.error("Erro ao remover solução:", error);
      toast.error("Erro ao remover solução");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return;

    try {
      await supabase.from("forum_posts").delete().eq("id", postId);

      toast.success("Post excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["forumTopic", topicId] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts", topicId] });
    } catch (error: any) {
      console.error("Erro ao excluir post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  const renderPost = (post: Post, isMainPost = false) => {
    const isPostOwner = post.user_id === user?.id;
    const canUserMarkAsSolved = isTopicOwner || isAdmin;
    
    return (
      <PostItem
        key={post.id}
        post={post}
        variant={isMainPost ? "detailed" : "default"}
        showActions={true}
        showContextMenu={isPostOwner || isAdmin}
        showModerationActions={isAdmin}
        showSolutionBadge={true}
        isReply={!isMainPost}
        isTopicAuthor={post.user_id === topic?.user_id}
        isAdmin={isAdmin}
        canMarkAsSolved={canUserMarkAsSolved && !isMainPost}
        onReply={() => handleReplyToPost(post.id)}
        onMarkAsSolved={() => handleMarkAsSolution(post.id)}
        onUnmarkAsSolved={() => handleUnmarkAsSolution(post.id)}
        onDelete={() => handleDeletePost(post.id)}
        className="mb-4"
      />
    );
  };

  if (topicLoading) {
    return (
      <Shell>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted rounded-md w-1/3"></div>
                    <div className="h-6 bg-muted rounded-md w-20"></div>
                  </div>
                  <div className="h-4 bg-muted rounded-md w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (topicError || !topic) {
    return (
      <Shell>
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            O tópico que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Button variant="ghost" size="sm" asChild className="p-0 mb-4">
        <Link to="/comunidade" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a Comunidade
        </Link>
      </Button>

      {renderPost({ ...topic, profiles: topic.profiles }, true)}

      <Separator className="my-4" />

      <div className="space-y-4">
        {posts?.map((post) => (
          <React.Fragment key={post.id}>
            {renderPost(post)}
            {replyingTo === post.id && (
              <div className="ml-8">
                <ReplyForm
                  topicId={topicId!}
                  parentId={post.id}
                  onSuccess={handlePostSuccess}
                  onCancel={handleCancelReply}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Separator className="my-4" />

      <ReplyForm topicId={topicId!} onSuccess={handlePostSuccess} />
    </Shell>
  );
};

export default TopicView;
