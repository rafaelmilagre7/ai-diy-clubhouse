
import { Badge } from "@/components/ui/badge";
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div 
        className="h-64 bg-cover bg-center"
        style={{ 
          backgroundImage: solution.thumbnail_url 
            ? `url(${solution.thumbnail_url})` 
            : `url('https://placehold.co/1200x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className={cn("bg-opacity-20 text-white border-white/30 backdrop-blur-sm badge-" + solution.category)}>
            {solution.category === "revenue" && "Aumento de Receita"}
            {solution.category === "operational" && "Otimização Operacional"}
            {solution.category === "strategy" && "Gestão Estratégica"}
          </Badge>
          <DifficultyBadge difficulty={solution.difficulty} />
        </div>
        <h1 className="text-3xl font-bold drop-shadow-sm">{solution.title}</h1>
      </div>
    </div>
  );
};
