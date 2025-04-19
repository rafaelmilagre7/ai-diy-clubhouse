
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuggestionHeader = () => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      className="flex items-center gap-2 mb-4" 
      onClick={() => navigate('/suggestions')}
    >
      <ArrowLeft size={16} />
      Voltar para sugestões
    </Button>
  );
};

export default SuggestionHeader;
