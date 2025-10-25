
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <div className="space-y-2">
      <h3 className={cn(
        "font-heading font-semibold text-lg line-clamp-2 text-foreground",
        "group-hover:text-primary transition-colors duration-slow"
      )}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
