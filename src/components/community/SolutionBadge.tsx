
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface SolutionBadgeProps {
  isSolved?: boolean;
}

export function SolutionBadge({ isSolved }: SolutionBadgeProps) {
  if (!isSolved) return null;
  
  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 ml-2 gap-1">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span>Resolvido</span>
    </Badge>
  );
}
