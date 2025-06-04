
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface UseCommentsProps {
  suggestionId: string;
  enabled?: boolean;
}

export const useComments = ({ suggestionId, enabled = false }: UseCommentsProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comentários desabilitados por padrão - não buscar mais
  const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => [],
    enabled: false, // Sempre desabilitado
    staleTime: 1000 * 60 // 1 minuto
  });

  const handleSubmitComment = async (e?: React.FormEvent) => {
    // Funcionalidade desabilitada
    toast.error('Comentários não estão mais disponíveis');
    return;
  };

  return {
    comment,
    setComment,
    comments,
    commentsLoading: false,
    isSubmitting: false,
    handleSubmitComment,
    refetchComments
  };
};
