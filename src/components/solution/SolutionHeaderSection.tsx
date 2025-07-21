
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Clock, Target } from "lucide-react";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl group hover:bg-white/8 transition-all duration-500">
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 rounded-2xl" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/15 to-viverblue-dark/15 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge 
              variant="secondary" 
              className="bg-viverblue/10 text-viverblue-light border-viverblue/20 hover:bg-viverblue/15 transition-colors"
            >
              <Target className="h-3 w-3 mr-1" />
              {solution.category}
            </Badge>
            
            <DifficultyBadge difficulty={solution.difficulty} />
            
            {solution.estimated_time && (
              <Badge 
                variant="outline" 
                className="text-neutral-300 border-neutral-600 hover:border-viverblue/30 hover:text-viverblue-light transition-colors"
              >
                <Clock className="h-3 w-3 mr-1" />
                {solution.estimated_time}min
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent">
            {solution.title}
          </h1>
          
          {/* Apenas description no header - resumo curto */}
          <p className="text-lg text-neutral-300 leading-relaxed">
            {solution.description}
          </p>
        </div>
      </div>
    </div>
  );
};
