
import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, List, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const SolutionNotFound = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const handleRefreshCache = () => {
    toast.info("Limpando cache e tentando novamente...");
    
    // Invalidar todas as queries relacionadas a soluções
    queryClient.invalidateQueries({ queryKey: ['solution'] });
    queryClient.invalidateQueries({ queryKey: ['solutions'] });
    
    // Se temos um ID específico, invalidar também essa query
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['solution', id] });
      console.log("Invalidando cache para solução:", id);
    }
    
    // Pequeno delay para melhor experiência do usuário
    setTimeout(() => {
      if (id) {
        // Se temos um ID, tentar recarregar a página atual
        window.location.reload();
      } else {
        // Caso contrário, voltar para a lista de soluções
        navigate('/solutions', { replace: true });
      }
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
        
        <p className="text-muted-foreground mb-2">
          A solução que você está procurando pode ter sido removida, renomeada 
          ou talvez nunca tenha existido.
        </p>
        
        {id && (
          <p className="text-sm text-muted-foreground mb-6">
            ID: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
          </p>
        )}
        
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
            <List className="h-4 w-4" />
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
