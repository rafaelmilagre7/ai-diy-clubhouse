
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { StatusBadge } from '../ui/StatusBadge';
import { GlassmorphismCard } from '../animations/GlassmorphismCard';
import { VoteAnimation } from '../animations/VoteAnimation';
import { useVoting } from '@/hooks/suggestions/useVoting';
import { Suggestion } from '@/types/suggestionTypes';
import { 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  ArrowRight, 
  Bookmark,
  Share2,
  MoreHorizontal,
  Zap
} from 'lucide-react';

interface EnhancedSuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

export const EnhancedSuggestionCard: React.FC<EnhancedSuggestionCardProps> = ({
  suggestion,
  index
}) => {
  const navigate = useNavigate();
  const { voteLoading, voteMutation } = useVoting();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCardClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    await voteMutation.mutateAsync({ 
      suggestionId: suggestion.id, 
      voteType 
    });
  };

  const authorInitials = suggestion.user_name
    ? suggestion.user_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const isHighPriority = suggestion.upvotes > 10 || suggestion.is_pinned;
  const totalVotes = suggestion.upvotes + suggestion.downvotes;
  const engagementLevel = totalVotes > 20 ? 'high' : totalVotes > 5 ? 'medium' : 'low';

  const gradientType = isHighPriority ? 'purple' : engagementLevel === 'high' ? 'green' : 'blue';

  return (
    <GlassmorphismCard
      delay={index * 0.1}
      gradient={gradientType}
      className="group cursor-pointer"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {suggestion.is_pinned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-fit"
              >
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1">
                  📌 Fixada
                </Badge>
              </motion.div>
            )}
            
            <motion.h3 
              className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300"
              onClick={handleCardClick}
            >
              {suggestion.title}
            </motion.h3>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={suggestion.status} size="sm" />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Bookmark 
                className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <motion.p 
          className="text-gray-600 line-clamp-3 leading-relaxed"
          onClick={handleCardClick}
        >
          {suggestion.description}
        </motion.p>

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between py-3 border-t border-white/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <VoteAnimation
                type="upvote"
                isActive={suggestion.user_vote_type === 'upvote'}
                onClick={() => handleVote('upvote')}
                disabled={voteLoading}
              />
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">{suggestion.upvotes}</div>
                <div className="text-xs text-gray-500">apoios</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <VoteAnimation
                type="downvote"
                isActive={suggestion.user_vote_type === 'downvote'}
                onClick={() => handleVote('downvote')}
                disabled={voteLoading}
              />
              <div className="text-center">
                <div className="text-sm font-bold text-red-600">{suggestion.downvotes}</div>
                <div className="text-xs text-gray-500">contra</div>
              </div>
            </div>
          </div>

          {engagementLevel === 'high' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-white/30">
              <AvatarImage src={suggestion.user_avatar} />
              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium text-gray-800">{suggestion.user_name || 'Usuário'}</div>
              <div className="text-xs text-gray-500">{formatRelativeDate(suggestion.created_at)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {suggestion.comment_count > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{suggestion.comment_count}</span>
              </div>
            )}

            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center gap-2"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-gray-600 hover:text-primary hover:bg-white/20"
                onClick={handleCardClick}
              >
                <span className="text-sm">Ver mais</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  );
};
