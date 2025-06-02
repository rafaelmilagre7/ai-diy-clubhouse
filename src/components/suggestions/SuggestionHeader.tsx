
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const SuggestionHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-2"
        onClick={() => navigate('/suggestions')}
      >
        <ChevronLeft size={16} />
        Voltar para sugestões
      </Button>
    </div>
  );
};

export default SuggestionHeader;
