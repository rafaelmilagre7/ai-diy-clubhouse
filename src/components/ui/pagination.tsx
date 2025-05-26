
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const showPrevious = currentPage > 0;
  const showNext = currentPage < totalPages - 1;
  
  // Função para gerar os botões de página
  const generatePageButtons = () => {
    const buttons = [];
    
    // Número máximo de botões a mostrar
    const maxButtons = 5;
    
    // Se tivermos 5 ou menos páginas, mostrar todos os botões
    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            className="w-10 h-10"
          >
            {i + 1}
          </Button>
        );
      }
    } else {
      // Mostrar botões para a primeira página, página atual e páginas adjacentes
      
      // Sempre mostrar a primeira página
      buttons.push(
        <Button
          key={0}
          variant={currentPage === 0 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(0)}
          className="w-10 h-10"
        >
          1
        </Button>
      );
      
      // Se não estivermos perto da primeira página, adicionar uma elipse
      if (currentPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
      
      // Mostrar páginas adjacentes à página atual
      const startAdj = Math.max(1, currentPage - 1);
      const endAdj = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = startAdj; i <= endAdj; i++) {
        if (i > 0 && i < totalPages - 1) {
          buttons.push(
            <Button
              key={i}
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(i)}
              className="w-10 h-10"
            >
              {i + 1}
            </Button>
          );
        }
      }
      
      // Se não estivermos perto da última página, adicionar uma elipse
      if (currentPage < totalPages - 3) {
        buttons.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      // Sempre mostrar a última página
      if (totalPages > 1) {
        buttons.push(
          <Button
            key={totalPages - 1}
            variant={currentPage === totalPages - 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages - 1)}
            className="w-10 h-10"
          >
            {totalPages}
          </Button>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!showPrevious}
        className="h-10 w-10 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {generatePageButtons()}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!showNext}
        className="h-10 w-10 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
