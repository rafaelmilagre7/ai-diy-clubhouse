
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface SolutionsGridLoaderProps {
  title: string;
  count?: number;
}

export const SolutionsGridLoader = ({ title, count = 3 }: SolutionsGridLoaderProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Text variant="section" textColor="primary">{title}</Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-40 bg-surface rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-surface-hover rounded w-20" />
                <div className="h-4 bg-surface-hover rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-surface-hover rounded w-3/4" />
                <div className="h-4 bg-surface-hover rounded w-full" />
                <div className="h-4 bg-surface-hover rounded w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 bg-surface-hover rounded w-24" />
                <div className="h-6 bg-surface-hover rounded w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
