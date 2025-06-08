
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

interface CardThumbnailProps {
  thumbnailUrl?: string | null;
  title?: string;
  className?: string;
}

export const CardThumbnail = ({ thumbnailUrl, title, className }: CardThumbnailProps) => {
  return (
    <div className={cn("aspect-video bg-surface-elevated relative overflow-hidden", className)}>
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={title || "Thumbnail"} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-surface">
          <Text variant="section" textColor="primary" className="text-gradient">
            {title ? title.charAt(0).toUpperCase() : "?"}
          </Text>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"></div>
    </div>
  );
};
