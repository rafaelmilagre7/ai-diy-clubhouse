
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl?: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  return (
    <div className={cn(
      "w-full h-40 overflow-hidden rounded-t-xl relative",
    )}>
      {thumbnailUrl ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
      ) : null}
      
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt="Miniatura da solução" 
          className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-card">
          <span className="text-muted-foreground text-base">Sem imagem</span>
        </div>
      )}
    </div>
  );
};
