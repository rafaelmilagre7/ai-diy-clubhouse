
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const SolutionBackButton = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    // Voltar para o dashboard como página principal
    navigate('/dashboard', { replace: true });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="mb-6" 
      onClick={handleBack}
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar para Dashboard
    </Button>
  );
};
