
import { Badge } from "@/components/ui/badge";
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";
import { Play } from "lucide-react";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-md animate-fade-in">
      <div 
        className="h-72 bg-cover bg-center transition-transform duration-500 hover:scale-105"
        style={{ 
          backgroundImage: solution.thumbnail_url 
            ? `url(${solution.thumbnail_url})` 
            : `url('https://placehold.co/1200x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
      </div>
      
      <div className="absolute top-4 right-4">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white/10 text-white backdrop-blur-sm">
            {solution.category === "revenue" && "Aumento de Receita"}
            {solution.category === "operational" && "Otimização Operacional"}
            {solution.category === "strategy" && "Gestão Estratégica"}
          </Badge>
          <DifficultyBadge difficulty={solution.difficulty} />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h1 className="text-3xl font-bold drop-shadow-sm">{solution.title}</h1>
        <p className="mt-2 text-white/90 max-w-xl line-clamp-2">
          {solution.description}
        </p>
        
        <div className="flex items-center mt-3">
          <div className="flex items-center mr-6">
            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2">
              <Play className="h-3 w-3 text-white" fill="white" />
            </div>
            <span className="text-sm text-white/80">8 módulos</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="text-sm text-white/80">Aprox. 1-2 horas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
