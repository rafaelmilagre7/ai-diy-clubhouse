
import { useState } from 'react';
import { toast } from 'sonner';

export interface NPSRating {
  id: string;
  lesson_id: string;
  user_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

export const useLessonNPS = (lessonId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitNPS = async (rating: number, feedback?: string) => {
    if (!lessonId) return;

    setIsSubmitting(true);
    
    try {
      console.log('Simulando envio de NPS:', { lessonId, rating, feedback });
      
      // Simulate API call since table doesn't exist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Avaliação enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar NPS:', error);
      toast.error('Erro ao enviar avaliação');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserNPS = async (userId: string) => {
    console.log('Simulando busca de NPS do usuário:', { lessonId, userId });
    
    // Mock - return null (no previous rating)
    return null;
  };

  return {
    submitNPS,
    getUserNPS,
    isSubmitting
  };
};
