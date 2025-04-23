
import React from 'react';
import { Search, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NoSolutionsPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-medium mb-2">Nenhuma solução encontrada</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Não encontramos soluções correspondentes aos seus critérios de busca. 
        Tente ajustar os filtros ou explorar outras categorias.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          variant="outline"
          onClick={() => navigate('/solutions')}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Ver todas as soluções
        </Button>
        <Button 
          onClick={() => navigate('/suggestions/new')}
          className="bg-[#0ABAB5] hover:bg-[#099388]"
        >
          Sugerir uma nova solução
        </Button>
      </div>
    </div>
  );
};
