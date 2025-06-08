
import { FC } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardThumbnailProps {
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
}

export const CardThumbnail: FC<CardThumbnailProps> = ({ 
  thumbnailUrl, 
  title, 
  className 
}) => {
  return (
    <div className={cn(
      "relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-xl overflow-hidden",
      className
    )}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-hover">
          <ImageIcon className="h-12 w-12 text-text-muted" />
        </div>
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
