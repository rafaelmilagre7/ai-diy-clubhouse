
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl?: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  return (
    <div className={cn(
      "w-full h-32 bg-[#1A1E2E] overflow-hidden",
    )}>
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt="Miniatura da solução" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1A1E2E]">
          <span className="text-neutral-600 text-lg font-medium">Sem imagem</span>
        </div>
      )}
    </div>
  );
};
