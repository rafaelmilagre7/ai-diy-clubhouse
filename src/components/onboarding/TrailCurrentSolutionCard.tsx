
import React from "react";
import { TrailSolutionCard } from "@/components/dashboard/TrailSolutionCard";

interface TrailCurrentSolutionCardProps {
  solution: any;
  onSelect: (id: string) => void;
}

export const TrailCurrentSolutionCard = ({ solution, onSelect }: TrailCurrentSolutionCardProps) => {
  if (!solution) return null;

  return (
    <TrailSolutionCard
      solution={{
        ...solution,
        title: solution.title || "Solução sem título",
        justification: solution.justification,
        solutionId: solution.solutionId,
        description: solution.description,
        priority: solution.priority
      }}
      onClick={onSelect}
    />
  );
};
