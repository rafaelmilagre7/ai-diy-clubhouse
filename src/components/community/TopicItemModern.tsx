
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Lock, CheckCircle, MessageCircle, Eye, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { CommunityTopic } from "@/types/communityTypes";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface TopicItemModernProps {
  topic: CommunityTopic;
  isPinned?: boolean;
}

export const TopicItemModern = ({ topic, isPinned = false }: TopicItemModernProps) => {
  const { openReportModal } = useReporting();
  const queryClient = useQueryClient();
  
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

  const handleModerationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['community-topics'] });
    queryClient.invalidateQueries({ queryKey: ['community-categories'] });
    queryClient.invalidateQueries({ queryKey: ['community-stats'] });
  };

  const categoryColors = {
    'Geral': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Suporte': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    'Implementação': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'Feedback': 'bg-orange-500/10 text-orange-700 border-orange-500/20'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group relative"
    >
      {/* Glow Effect for Pinned Topics */}
      {isPinned && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
      )}
      
      {/* Main Card */}
      <div className={`relative bg-background/80 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl ${
        isPinned 
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5' 
          : 'border-border/50 hover:border-border/80'
      }`}>
        
        <Link
          to={`/comunidade/topico/${topic.id}`}
          className="block"
        >
          <div className="flex gap-4">
            {/* Enhanced Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-border/20 ring-offset-2 ring-offset-background">
                  <AvatarImage src={topic.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {getInitials(topic.profiles?.name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background shadow-lg"></div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with Meta Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
                <span className="font-medium text-foreground">
                  {topic.profiles?.name || 'Usuário'}
                </span>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(topic.created_at)}</span>
                </div>
                
                {topic.category && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${
                      categoryColors[topic.category.name as keyof typeof categoryColors] || 
                      'bg-gray-500/10 text-gray-700 border-gray-500/20'
                    }`}
                  >
                    {topic.category.name}
                  </Badge>
                )}
              </div>
              
              {/* Title with Status Badges */}
              <div className="flex items-start gap-3 mb-3">
                <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 flex-1 group-hover:text-primary">
                  {topic.title}
                </h3>
                
                <div className="flex gap-2 flex-shrink-0">
                  {topic.is_pinned && (
                    <Badge className="gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30">
                      <Pin className="h-3 w-3" />
                      Fixado
                    </Badge>
                  )}
                  
                  {topic.is_locked && (
                    <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-700 border-red-500/20">
                      <Lock className="h-3 w-3" />
                      Travado
                    </Badge>
                  )}
                  
                  {topic.is_solved && (
                    <Badge className="gap-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border-emerald-500/30">
                      <CheckCircle className="h-3 w-3" />
                      Resolvido
                    </Badge>
                  )}
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <MessageCircle className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium">{topic.reply_count || 0}</span>
                  <span className="text-xs">respostas</span>
                </div>
                
                <div className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <div className="p-1.5 rounded-lg bg-accent/10">
                    <Eye className="h-3 w-3 text-accent" />
                  </div>
                  <span className="font-medium">{topic.view_count || 0}</span>
                  <span className="text-xs">visualizações</span>
                </div>
                
                {topic.last_activity_at && (
                  <div className="flex items-center gap-1.5 text-xs ml-auto">
                    <Clock className="h-3 w-3" />
                    <span>Última atividade: {formatDate(topic.last_activity_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Moderation Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ModerationActions
            type="topic"
            itemId={topic.id}
            currentState={{
              isPinned: topic.is_pinned,
              isLocked: topic.is_locked,
              isHidden: false
            }}
            onReport={() => openReportModal('topic', topic.id, topic.user_id)}
            onSuccess={handleModerationSuccess}
          />
        </div>
      </div>
    </motion.div>
  );
};
