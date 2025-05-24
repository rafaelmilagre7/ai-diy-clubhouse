
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionBadgeProps {
  isSolved: boolean;
  className?: string;
}

export const SolutionBadge = ({ isSolved, className }: SolutionBadgeProps) => {
  if (!isSolved) return null;

  return (
    <Badge 
      className={cn(
        "bg-green-600 hover:bg-green-500 text-white gap-1", 
        className
      )}
    >
      <CheckCircle className="h-3 w-3" />
      Resolvido
    </Badge>
  );
};
