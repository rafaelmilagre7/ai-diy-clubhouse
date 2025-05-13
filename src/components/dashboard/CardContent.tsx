
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <div className="space-y-2">
      <h3 className={cn(
        "font-medium text-lg line-clamp-2 text-white",
        "group-hover:text-white transition-colors duration-300"
      )}>
        {title}
      </h3>
      <p className="text-neutral-300 text-sm line-clamp-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
