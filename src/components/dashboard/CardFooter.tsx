
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CardFooterProps {
  createdAt: string;
  onSelect: () => void;
}

export const CardFooterSection = ({ createdAt, onSelect }: CardFooterProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-t w-full">
      <div className="flex items-center text-sm text-neutral-500">
        <span>{new Date(createdAt).toLocaleDateString()}</span>
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
