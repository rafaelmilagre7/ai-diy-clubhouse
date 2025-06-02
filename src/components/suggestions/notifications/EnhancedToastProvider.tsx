
import React from 'react';
import { toast } from 'sonner';
import { ThumbsUp, ThumbsDown, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

export const enhancedToast = {
  voting: (voteType: 'upvote' | 'downvote') => {
    const icon = voteType === 'upvote' ? ThumbsUp : ThumbsDown;
    const message = voteType === 'upvote' ? 'Voto positivo registrado!' : 'Voto negativo registrado!';
    
    toast.success(message, {
      icon: React.createElement(icon, { className: 'h-4 w-4' }),
      duration: 2000,
    });
  },

  comment: () => {
    toast.success('Comentário adicionado com sucesso!', {
      icon: React.createElement(MessageCircle, { className: 'h-4 w-4' }),
      duration: 3000,
    });
  },

  suggestionCreated: () => {
    toast.success('Sugestão criada com sucesso!', {
      icon: React.createElement(CheckCircle, { className: 'h-4 w-4' }),
      duration: 4000,
      description: 'Sua sugestão foi enviada e está sendo analisada pela equipe.',
    });
  },

  error: (title: string, description?: string) => {
    toast.error(title, {
      icon: React.createElement(AlertCircle, { className: 'h-4 w-4' }),
      duration: 5000,
      description,
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  }
};

// Hook para usar o sistema de toasts aprimorado
export const useEnhancedToast = () => {
  return enhancedToast;
};
