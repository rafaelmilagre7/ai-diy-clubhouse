
import React from "react";
import { Solution } from "@/lib/supabase";
import { SolutionContentSection } from "@/components/solution/SolutionContentSection";

interface SolutionTabsContentProps {
  solution: Solution;
}

export const SolutionTabsContent = ({ solution }: SolutionTabsContentProps) => {
  return (
    <div className="w-full">
      <SolutionContentSection solution={solution} />
    </div>
  );
};
