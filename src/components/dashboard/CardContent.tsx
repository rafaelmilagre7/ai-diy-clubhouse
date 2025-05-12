
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <div className="space-y-1.5">
      <h3 className={cn(
        "font-medium text-base line-clamp-2 text-white",
        "group-hover:text-white/90 transition-colors duration-300"
      )}>
        {title}
      </h3>
      <p className="text-neutral-400 text-sm line-clamp-2">
        {description}
      </p>
    </div>
  );
};
