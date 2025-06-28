
import { useState } from 'react';
import { toast } from 'sonner';

export const useSuggestionCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSuggestion = async (values: {
    title: string;
    description: string;
    category_id: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      console.log('Simulando criação de sugestão:', values);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Sugestão criada com sucesso!');
      
      return { id: Date.now().toString(), ...values };
    } catch (error: any) {
      console.error('Erro ao criar sugestão:', error);
      toast.error('Erro ao criar sugestão');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSuggestion
  };
};
