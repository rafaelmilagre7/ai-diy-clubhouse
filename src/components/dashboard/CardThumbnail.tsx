
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  return (
    <div className="relative h-40 overflow-hidden rounded-t-xl">
      {/* Thumbnail principal */}
      <div 
        className="h-full w-full bg-cover bg-center transform transition-transform duration-500 hover:scale-105"
        style={{ 
          backgroundImage: thumbnailUrl 
            ? `url(${thumbnailUrl})` 
            : `url('https://placehold.co/600x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
        }}
      />
      
      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
      
      {/* Efeito de brilho sutil no topo */}
      <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white/20 to-transparent"></div>
    </div>
  );
};
