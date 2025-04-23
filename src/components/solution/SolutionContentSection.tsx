
import React from "react";

interface SolutionContentSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export const SolutionContentSection = ({ 
  title, 
  description, 
  icon, 
  children 
}: SolutionContentSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      
      {children}
    </div>
  );
};
