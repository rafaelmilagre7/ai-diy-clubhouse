
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageCircle, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '../ui/StatusBadge';

interface AdminSuggestionViewProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    profiles?: {
      name: string;
      avatar_url: string;
    };
  };
}

export const AdminSuggestionView = ({ suggestion }: AdminSuggestionViewProps) => {
  const userName = suggestion.user_name || suggestion.profiles?.name || 'Usuário Anônimo';
  const userAvatar = suggestion.user_avatar || suggestion.profiles?.avatar_url;
  const voteBalance = suggestion.upvotes - suggestion.downvotes;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="bg-backgroundLight border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-textPrimary mb-2">
              {suggestion.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-textSecondary">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} />
                  ) : (
                    <AvatarFallback className="text-xs bg-viverblue text-white">
                      {getInitials(userName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>Por {userName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(suggestion.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={suggestion.status} size="lg" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Descrição da sugestão */}
        <div className="bg-[#151823] border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-textPrimary">Descrição</h3>
          <div className="text-textSecondary whitespace-pre-wrap leading-relaxed">
            {suggestion.description}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#151823] border border-white/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-textPrimary">{suggestion.upvotes}</span>
            </div>
            <span className="text-sm text-textSecondary">Votos Positivos</span>
          </div>
          
          <div className="bg-[#151823] border border-white/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-textPrimary">{suggestion.downvotes}</span>
            </div>
            <span className="text-sm text-textSecondary">Votos Negativos</span>
          </div>
          
          <div className="bg-[#151823] border border-white/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-viverblue" />
              <span className="text-2xl font-bold text-textPrimary">{suggestion.comment_count}</span>
            </div>
            <span className="text-sm text-textSecondary">Comentários</span>
          </div>
        </div>

        {/* Resumo da avaliação */}
        <div className="bg-[#151823] border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-textPrimary">Avaliação da Comunidade</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-textSecondary">Aprovação da comunidade</span>
                <span className="text-textPrimary font-medium">
                  {voteBalance > 0 ? `+${voteBalance}` : voteBalance} votos
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    voteBalance > 0 ? 'bg-green-500' : voteBalance < 0 ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(voteBalance) * 10, 100)}%` 
                  }}
                />
              </div>
            </div>
            <Badge 
              variant={voteBalance > 0 ? 'default' : voteBalance < 0 ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {voteBalance > 0 ? 'Popular' : voteBalance < 0 ? 'Controversa' : 'Neutra'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
