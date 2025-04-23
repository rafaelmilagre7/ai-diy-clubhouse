
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export const MaterialsLoading: React.FC = () => {
  return (
    <GlassCard className="p-6 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <div className="h-10 w-3/4 bg-gray-100 rounded"></div>
            <div className="h-8 w-20 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
