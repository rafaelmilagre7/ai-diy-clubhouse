
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

export const EmptyImplementationsState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#1A1E2E] rounded-lg border border-neutral-700/50 animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-viverblue/10 flex items-center justify-center mb-4">
        <Lightbulb className="h-8 w-8 text-viverblue" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Nenhuma implementação encontrada</h3>
      <p className="text-neutral-400 max-w-md mb-6">
        Parece que você ainda não iniciou nenhuma implementação. 
        Explore nossas soluções para começar a implementar IA no seu negócio.
      </p>
      <Button asChild>
        <Link to="/dashboard">
          Explorar soluções
        </Link>
      </Button>
    </div>
  );
};
