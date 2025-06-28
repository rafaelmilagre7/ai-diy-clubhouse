
import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NoSolutionsPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Lightbulb className="h-16 w-16 text-viverblue mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma solução encontrada
          </h3>
          <p className="text-neutral-400">
            Explore nosso catálogo de soluções e comece a implementar IA no seu negócio
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/solutions')}
          className="bg-viverblue hover:bg-viverblue/80 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Explorar Soluções
        </Button>
      </div>
    </div>
  );
};
