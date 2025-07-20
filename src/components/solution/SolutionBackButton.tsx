
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const SolutionBackButton = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    // Tentar navegar para a página de soluções, ou para o dashboard se algo der errado
    navigate('/solutions', { replace: true });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="mb-6 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300" 
      onClick={handleBack}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar para Soluções
    </Button>
  );
};
