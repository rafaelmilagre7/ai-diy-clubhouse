
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CardThumbnailProps {
  thumbnailUrl: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const defaultImage = 'https://placehold.co/600x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+HUB&font=montserrat';
  
  const imageUrl = thumbnailUrl || defaultImage;

  return (
    <div className="relative h-44 overflow-hidden rounded-t-xl">
      {/* Thumbnail principal com efeito de zoom suave no hover */}
      <div 
        className={cn(
          "h-full w-full bg-cover bg-center transition-all duration-700",
          "group-hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Carregamos a imagem realmente para detectar quando ela terminar de carregar */}
        <img 
          src={imageUrl}
          alt=""
          className="hidden"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      {/* Placeholder enquanto a imagem carrega */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <div className="w-8 h-8 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Overlay gradiente dinâmico */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70"></div>
      
      {/* Efeito de brilho no topo */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white/30 to-transparent"></div>
      
      {/* Overlay de hover */}
      <div className="absolute inset-0 bg-viverblue/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  );
};
