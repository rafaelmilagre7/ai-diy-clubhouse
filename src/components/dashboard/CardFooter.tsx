
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface CardFooterProps {
  createdAt: string;
  onSelect: () => void;
}

// Função para formatar a data relativa (implementada no utils)
const formatRelative = (dateString: string): string => {
  // Fallback temporário caso a função de utils não esteja disponível
  try {
    return formatRelativeDate(dateString);
  } catch (e) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  }
};

export const CardFooterSection = ({ createdAt, onSelect }: CardFooterProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-t w-full">
      <div className="flex items-center text-sm text-neutral-500">
        <Clock className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
        <span>{formatRelative(createdAt)}</span>
      </div>
      <Button 
        onClick={onSelect}
        className="bg-gradient-to-r from-viverblue to-viverblue-light hover:opacity-90 rounded-full p-2 h-auto w-auto transition-all duration-300 hover:shadow-md"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
