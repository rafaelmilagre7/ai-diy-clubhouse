
import React from "react";
import { TrailPanelHeader } from "../TrailGenerationPanel/TrailPanelHeader";
import { TrailPanelSolutions } from "../TrailGenerationPanel/TrailPanelSolutions";
import { TrailPanelActions } from "../TrailGenerationPanel/TrailPanelActions";
import { TrailPanelCourses } from "../TrailGenerationPanel/TrailPanelCourses";
import { Separator } from "@/components/ui/separator";

interface TrailSolutionsProps {
  solutions: any[];
  courses?: any[];
  onRegenerate?: () => void;
  onClose?: () => void;
}

export const TrailSolutions = ({ solutions, courses = [], onRegenerate, onClose }: TrailSolutionsProps) => {
  return (
    <div className="w-full bg-gradient-to-br from-[#0ABAB5]/10 via-[#0ABAB5]/5 to-transparent border border-[#0ABAB5]/20 rounded-2xl shadow-lg p-8 mb-4 animate-fade-in">
      <TrailPanelHeader />
      
      {/* Soluções recomendadas */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-[#0ABAB5]">
          Soluções para implementar:
        </h3>
        <TrailPanelSolutions solutions={solutions} />
      </div>
      
      {/* Cursos recomendados se houver */}
      {courses && courses.length > 0 && (
        <>
          <Separator className="my-6 bg-[#0ABAB5]/20" />
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-[#0ABAB5]">
              Aulas recomendadas para você:
            </h3>
            <TrailPanelCourses courses={courses} />
          </div>
        </>
      )}
      
      <TrailPanelActions onRegenerate={onRegenerate} onClose={onClose} />
    </div>
  );
};
