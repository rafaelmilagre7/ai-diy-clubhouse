
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const SuggestionHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => navigate('/suggestions')}
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar para sugestões
      </Button>
    </div>
  );
};

export default SuggestionHeader;
