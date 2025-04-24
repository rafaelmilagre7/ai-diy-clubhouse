
import React from "react";
import { TrailPanelHeader } from "../TrailGenerationPanel/TrailPanelHeader";
import { TrailPanelSolutions } from "../TrailGenerationPanel/TrailPanelSolutions";
import { TrailPanelActions } from "../TrailGenerationPanel/TrailPanelActions";

interface TrailSolutionsProps {
  solutions: any[];
  onRegenerate?: () => void;
  onClose?: () => void;
}

export const TrailSolutions = ({ solutions, onRegenerate, onClose }: TrailSolutionsProps) => {
  return (
    <div className="w-full bg-gradient-to-br from-[#0ABAB5]/5 to-white border-[#0ABAB5]/15 rounded-2xl shadow p-8 mb-4 animate-fade-in">
      <TrailPanelHeader />
      <TrailPanelSolutions solutions={solutions} />
      <TrailPanelActions onRegenerate={onRegenerate} onClose={onClose} />
    </div>
  );
};
