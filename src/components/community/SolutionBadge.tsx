
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionBadgeProps {
  isSolved: boolean;
  className?: string;
}

export const SolutionBadge = ({ isSolved, className }: SolutionBadgeProps) => {
  if (!isSolved) return null;
  
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full text-xs font-medium bg-success/20 text-success px-2 py-0.5",
        className
      )}
    >
      <CheckCircle className="h-3 w-3 mr-1" />
      <span>Resolvido</span>
    </div>
  );
};
