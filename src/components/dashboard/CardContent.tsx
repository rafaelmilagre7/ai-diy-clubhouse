
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <div className="space-y-2">
      <h3 className={cn(
        "font-heading font-semibold text-lg line-clamp-2 text-neutral-800 dark:text-neutral-100",
        "group-hover:text-viverblue dark:group-hover:text-viverblue-light transition-colors duration-300"
      )}>
        {title}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-2">
        {description}
      </p>
      <div className="h-1 w-12 bg-gradient-to-r from-viverblue to-viverblue-light/50 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-24"></div>
    </div>
  );
};
