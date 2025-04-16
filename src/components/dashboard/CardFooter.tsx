
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CardFooterProps {
  createdAt: string;
  onSelect: () => void;
}

export const CardFooterSection = ({ createdAt, onSelect }: CardFooterProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-t">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={onSelect}>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
