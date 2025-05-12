
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl?: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  return (
    <div className={cn(
      "w-full h-36 bg-[#1A1E2E] overflow-hidden rounded-t-xl",
    )}>
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt="Miniatura da solução" 
          className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1E2E] to-[#151823]">
          <span className="text-neutral-600 text-base">Sem imagem</span>
        </div>
      )}
    </div>
  );
};
