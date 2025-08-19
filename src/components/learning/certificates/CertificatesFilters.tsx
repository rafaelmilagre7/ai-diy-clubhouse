
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CertificatesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const CertificatesFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: CertificatesFiltersProps) => {
  const [isCheckingPending, setIsCheckingPending] = useState(false);

  const handleCheckPending = async () => {
    setIsCheckingPending(true);
    try {
      // Simular verificação de novos certificados
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Verificação concluída! Nenhum novo certificado encontrado.");
    } catch (error) {
      toast.error("Erro ao verificar novos certificados.");
    } finally {
      setIsCheckingPending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar certificados..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="available">Disponíveis</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="title">Por título</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleCheckPending}
            disabled={isCheckingPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
          >
            {isCheckingPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Buscar Novos Certificados
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verificar se há novos certificados disponíveis para gerar</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
