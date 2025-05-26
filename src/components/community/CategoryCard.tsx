
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  onClick?: () => void;
}

export const CategoryCard = ({ id, name, description, slug, icon, onClick }: CategoryCardProps) => {
  // Lista de cores para categorias
  const categoryColors = [
    "bg-blue-500/10 text-blue-500",
    "bg-green-500/10 text-green-500",
    "bg-purple-500/10 text-purple-500", 
    "bg-amber-500/10 text-amber-500",
    "bg-pink-500/10 text-pink-500",
    "bg-indigo-500/10 text-indigo-500",
    "bg-red-500/10 text-red-500",
    "bg-cyan-500/10 text-cyan-500"
  ];
  
  // Gerar uma cor baseada no ID (para ser consistente)
  const colorIndex = id.charCodeAt(0) % categoryColors.length;
  const colorClass = categoryColors[colorIndex];
  
  return (
    <Link to={`/comunidade/categoria/${slug}`} onClick={onClick}>
      <Card className="h-full p-5 flex flex-col hover:bg-accent/50 transition-colors cursor-pointer border-transparent hover:border-muted">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        
        {description && (
          <p className="text-muted-foreground text-sm flex-grow">
            {description}
          </p>
        )}
      </Card>
    </Link>
  );
};
