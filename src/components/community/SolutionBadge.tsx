
import { CheckCircle2 } from "lucide-react";

interface SolutionBadgeProps {
  isSolved: boolean;
  className?: string;
}

export const SolutionBadge = ({ isSolved, className = "" }: SolutionBadgeProps) => {
  if (!isSolved) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-green-600 ${className}`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span>Resolvido</span>
    </span>
  );
};
