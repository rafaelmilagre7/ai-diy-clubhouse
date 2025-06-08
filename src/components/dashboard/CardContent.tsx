
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <div className="space-y-2">
      <Text 
        variant="card" 
        textColor="primary"
        className={cn(
          "line-clamp-2",
          "group-hover:text-primary transition-colors duration-300"
        )}
      >
        {title}
      </Text>
      <Text 
        variant="body-small" 
        textColor="secondary" 
        className="line-clamp-2 leading-relaxed"
      >
        {description}
      </Text>
    </div>
  );
};
