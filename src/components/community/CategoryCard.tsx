
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
}

export const CategoryCard = ({ id, name, description, slug, icon }: CategoryCardProps) => {
  // Lista de cores para categorias
  const categoryColors = [
    "from-blue-500/20 to-blue-600/10 text-blue-600",
    "from-green-500/20 to-green-600/10 text-green-600",
    "from-purple-500/20 to-purple-600/10 text-purple-600", 
    "from-amber-500/20 to-amber-600/10 text-amber-600",
    "from-pink-500/20 to-pink-600/10 text-pink-600",
    "from-indigo-500/20 to-indigo-600/10 text-indigo-600",
    "from-red-500/20 to-red-600/10 text-red-600",
    "from-cyan-500/20 to-cyan-600/10 text-cyan-600"
  ];
  
  // Gerar uma cor baseada no ID (para ser consistente)
  const colorIndex = id.charCodeAt(0) % categoryColors.length;
  const gradientClass = categoryColors[colorIndex];
  
  return (
    <Link to={`/comunidade/categoria/${slug}`} className="block group">
      <Card className="relative h-full p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/10">
        {/* Glow effect no hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Conteúdo */}
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <MessageSquare className="h-6 w-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {name}
              </h3>
            </div>
          </div>
          
          {description && (
            <p className="text-muted-foreground leading-relaxed flex-grow group-hover:text-foreground/80 transition-colors duration-300">
              {description}
            </p>
          )}
          
          {/* Decorative gradient line */}
          <div className="mt-4 h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Card>
    </Link>
  );
};
