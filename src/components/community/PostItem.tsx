
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Profile {
  name: string | null;
  avatar_url: string | null;
}

interface PostItemProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: Profile | null;
    is_solution?: boolean;
    reaction_count?: number;
    user_has_reacted?: boolean;
  };
  isTopicAuthor?: boolean;
  isTopicStarter?: boolean;
  canMarkSolution?: boolean;
  topicId: string;
}

export const PostItem = ({ post, isTopicAuthor, isTopicStarter, canMarkSolution, topicId }: PostItemProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleReaction = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para reagir a um post");
      return;
    }
    
    try {
      setIsLiking(true);
      
      if (!isTopicStarter) {
        console.log("Processando reação para o post:", post.id);
        
        // Verificar se já reagiu
        const { data: existingReaction, error: checkError } = await supabase
          .from("forum_reactions")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .single();
        
        if (checkError && checkError.code !== "PGRST116") {
          console.error("Erro ao verificar reação existente:", checkError);
          throw checkError;
        }
        
        if (existingReaction) {
          console.log("Removendo reação existente:", existingReaction.id);
          
          // Remover reação
          const { error: deleteError } = await supabase
            .from("forum_reactions")
            .delete()
            .eq("id", existingReaction.id);
          
          if (deleteError) throw deleteError;
          toast.success("Reação removida");
        } else {
          console.log("Adicionando nova reação");
          
          // Adicionar reação
          const { data, error: insertError } = await supabase
            .from("forum_reactions")
            .insert({
              post_id: post.id,
              user_id: user.id,
              reaction_type: "like"
            })
            .select();
          
          if (insertError) throw insertError;
          
          console.log("Reação adicionada com sucesso:", data);
          toast.success("Você reagiu a este post");
        }
        
        // Atualizar dados
        queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      }
    } catch (error: any) {
      console.error("Erro ao reagir ao post:", error);
      toast.error(`Não foi possível processar sua reação: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsLiking(false);
    }
  };
  
  const markAsSolution = async () => {
    if (!user?.id || !canMarkSolution) return;
    
    try {
      setIsMarking(true);
      
      console.log("Marcando post como solução:", post.id, "Estado atual:", post.is_solution);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ is_solution: !post.is_solution })
        .eq('id', post.id)
        .select();
      
      if (error) {
        console.error("Erro ao atualizar status de solução:", error);
        throw error;
      }
      
      console.log("Post atualizado com sucesso:", data);
      
      // Atualizar cache
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      
      toast.success(post.is_solution 
        ? "Post desmarcado como solução" 
        : "Post marcado como solução"
      );
    } catch (error: any) {
      console.error("Erro ao marcar solução:", error);
      toast.error(`Não foi possível marcar como solução: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <Card className={`p-4 ${post.is_solution ? 'border-green-500 bg-green-50/5' : ''}`}>
      <div className="flex justify-between mb-4">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{post.profiles?.name || "Usuário"}</p>
              {isTopicAuthor && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 rounded-full">
                  Autor
                </Badge>
              )}
              {post.is_solution && (
                <Badge variant="success" className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Solução
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        
        {canMarkSolution && !isTopicStarter && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAsSolution}
            disabled={isMarking}
            className="text-xs h-8"
          >
            {isMarking ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processando...
              </>
            ) : (
              post.is_solution ? "Remover solução" : "Marcar como solução"
            )}
          </Button>
        )}
      </div>
      
      <div className="whitespace-pre-wrap mb-4">{post.content}</div>
      
      {!isTopicStarter && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReaction}
            disabled={isLiking}
            className={`text-xs gap-1 h-8 ${post.user_has_reacted ? 'text-primary' : ''}`}
          >
            {isLiking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${post.user_has_reacted ? 'fill-primary' : ''}`} />
            )}
            <span>{post.reaction_count || 0}</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
