
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const SolutionNotFound = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const handleRefreshCache = () => {
    toast.info("Limpando cache e tentando novamente...");
    queryClient.invalidateQueries({ queryKey: ['solution'] });
    queryClient.invalidateQueries({ queryKey: ['solutions'] });
    
    // Pequeno delay para melhor experiência do usuário
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
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
          ou talvez nunca tenha existido. Verifique o ID na URL.
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
            className="flex items-center gap-2"
            onClick={() => navigate('/solutions')}
          >
            <Home className="h-4 w-4" />
            Ver todas as soluções
          </Button>
          
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={handleRefreshCache}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
};
