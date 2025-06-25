
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

const SuggestionLoadingState = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
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

      <LoadingScreen
        message="Carregando sugestão"
        variant="skeleton"
        fullScreen={false}
        className="min-h-[400px]"
      />
    </div>
  );
};

export default SuggestionLoadingState;
