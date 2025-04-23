
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';

export const SolutionNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <div className="rounded-full bg-gray-100 w-20 h-20 mx-auto flex items-center justify-center mb-6">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">
          Solução não encontrada
        </h1>
        
        <p className="text-muted-foreground mb-6">
          A solução que você está procurando pode ter sido removida, renomeada 
          ou talvez nunca tenha existido.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => navigate('/solutions')}
          >
            Ver todas as soluções
          </Button>
        </div>
      </div>
    </div>
  );
};
