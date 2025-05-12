
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CardFooterProps {
  createdAt?: string;
  onSelect: () => void;
}

export const CardFooterSection = ({ createdAt, onSelect }: CardFooterProps) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 border-t border-neutral-800/50">
      <div className="text-xs text-neutral-500">
        {createdAt ? formatDate(new Date(createdAt)) : "Data não disponível"}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="p-0 h-6 text-neutral-400 hover:text-white hover:bg-transparent transition-colors"
      >
        <span className="mr-1 text-xs">Detalhes</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
