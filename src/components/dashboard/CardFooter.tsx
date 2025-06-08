
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CardFooterProps {
  createdAt?: string;
  onSelect: () => void;
}

export const CardFooterSection = ({ createdAt, onSelect }: CardFooterProps) => {
  return (
    <div className="flex items-center justify-between w-full pt-3 border-t border-border-subtle">
      <Text variant="caption" textColor="tertiary">
        {createdAt ? formatDate(new Date(createdAt)) : "Data não disponível"}
      </Text>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="p-0 h-6 text-text-tertiary hover:text-primary hover:bg-transparent transition-colors"
      >
        <Text variant="caption" className="mr-1">Detalhes</Text>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
