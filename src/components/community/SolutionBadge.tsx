
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SolutionBadgeProps {
  isSolved: boolean;
  className?: string;
}

export const SolutionBadge = ({ isSolved, className = "" }: SolutionBadgeProps) => {
  if (!isSolved) return null;

  return (
    <Badge 
      variant="outline"
      className={`bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1 ${className}`}
    >
      <CheckCircle2 className="h-3 w-3" />
      <span>Resolvido</span>
    </Badge>
  );
};
