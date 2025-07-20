
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThumbsUp, MessageSquare, Flag, MoreVertical, Check } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ReplyForm } from "./ReplyForm";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    is_solution?: boolean;
    profiles?: {
      name: string | null;
      avatar_url: string | null;
    } | null;
    reaction_count?: number;
    user_has_reacted?: boolean;
  };
  isTopicAuthor?: boolean;
  isTopicStarter?: boolean;
  canMarkSolution?: boolean;
  topicId: string;
}

export const PostItem = ({ 
  post, 
  isTopicAuthor = false,
  isTopicStarter = false,
  canMarkSolution = false,
  topicId
}: PostItemProps) => {
  const { user, profile } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [hasReacted, setHasReacted] = useState(post.user_has_reacted || false);
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0);
  const [isMarkingSolution, setIsMarkingSolution] = useState(false);
  const queryClient = useQueryClient();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isPostAuthor = user?.id === post.user_id;

  const handleReaction = async () => {
    if (isReacting) return;
    
    try {
      setIsReacting(true);
      
      if (hasReacted) {
        // Remove a reação
        const { error } = await supabase
          .from('forum_reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user?.id);
          
        if (error) throw error;
        setHasReacted(false);
        setReactionCount(prev => Math.max(0, prev - 1));
        
      } else {
        // Adiciona a reação
        const { error } = await supabase
          .from('forum_reactions')
          .insert({
            post_id: post.id,
            user_id: user?.id,
            reaction_type: 'like'
          });
          
        if (error) throw error;
        setHasReacted(true);
        setReactionCount(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Erro ao reagir:', error);
      toast.error('Não foi possível processar sua reação');
    } finally {
      setIsReacting(false);
    }
  };

  const markAsSolution = async () => {
    if (isMarkingSolution) return;
    
    try {
      setIsMarkingSolution(true);
      
      // Marca o post como solução
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast.success('Resposta marcada como solução!');
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      
    } catch (error) {
      console.error('Erro ao marcar solução:', error);
      toast.error('Não foi possível marcar esta resposta como solução');
    } finally {
      setIsMarkingSolution(false);
    }
  };

  return (
    <Card className={post.is_solution ? "border-green-500 border-2" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url || undefined} alt={post.profiles?.name || "Usuário"} />
            <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.profiles?.name || "Usuário Anônimo"}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
              {isTopicStarter && <span className="ml-2 px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded-sm">Autor</span>}
              {post.is_solution && <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-sm">✓ Solução</span>}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Mais opções</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canMarkSolution && !post.is_solution && (
              <DropdownMenuItem onClick={markAsSolution}>
                <Check className="h-4 w-4 mr-2" /> Marcar como solução
              </DropdownMenuItem>
            )}
            <DropdownMenuItem disabled={!isPostAuthor}>
              {isPostAuthor ? 'Editar' : 'Não pode editar'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" /> Reportar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="prose dark:prose-invert max-w-none">
          <p>{post.content}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={hasReacted ? "text-primary" : ""}
            onClick={handleReaction}
            disabled={isReacting}
          >
            <ThumbsUp className="h-4 w-4 mr-1" /> 
            {reactionCount > 0 && reactionCount}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="h-4 w-4 mr-1" /> Responder
          </Button>
        </div>
      </CardFooter>
      
      {showReplyForm && (
        <div className="px-6 pb-4">
          <Separator className="my-2" />
          <ReplyForm 
            topicId={topicId} 
            parentId={post.id} 
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </Card>
  );
};
