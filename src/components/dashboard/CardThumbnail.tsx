
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl: string | null;
}

export const CardThumbnail = ({ thumbnailUrl }: CardThumbnailProps) => {
  return (
    <div 
      className="h-40 bg-cover bg-center rounded-t-xl"
      style={{ 
        backgroundImage: thumbnailUrl 
          ? `url(${thumbnailUrl})` 
          : `url('https://placehold.co/600x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
      }}
    />
  );
};
