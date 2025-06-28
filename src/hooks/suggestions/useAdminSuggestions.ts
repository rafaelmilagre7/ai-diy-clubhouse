
import { useState } from 'react';
import { toast } from 'sonner';

export interface AdminSuggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

export const useAdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateSuggestionStatus = async (id: string, status: string) => {
    console.log('Simulando atualização de status da sugestão:', { id, status });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id ? { ...suggestion, status } : suggestion
      )
    );
    
    toast.success('Status da sugestão atualizado com sucesso!');
  };

  const deleteSuggestion = async (id: string) => {
    console.log('Simulando exclusão de sugestão:', id);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
    toast.success('Sugestão excluída com sucesso!');
  };

  return {
    suggestions,
    isLoading,
    loading: isLoading, // Add loading alias for compatibility
    updateSuggestionStatus,
    deleteSuggestion,
    removeSuggestion: deleteSuggestion // Add removeSuggestion alias for compatibility
  };
};
