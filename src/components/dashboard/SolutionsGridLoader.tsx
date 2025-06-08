
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface SolutionsGridLoaderProps {
  title: string;
  count?: number;
}

export const SolutionsGridLoader: FC<SolutionsGridLoaderProps> = ({ 
  title, 
  count = 3 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-32 bg-surface animate-pulse rounded"></div>
        <div className="h-4 w-4 bg-surface animate-pulse rounded-full"></div>
      </div>
      
      <Text variant="body" textColor="secondary" className="animate-pulse">
        {title}
      </Text>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            {/* Thumbnail placeholder */}
            <div className="aspect-video bg-surface-hover"></div>
            
            {/* Content placeholder */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-surface-hover rounded"></div>
                <div className="h-4 w-16 bg-surface-hover rounded"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-surface-hover rounded"></div>
                <div className="h-4 w-full bg-surface-hover rounded"></div>
                <div className="h-4 w-2/3 bg-surface-hover rounded"></div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-24 bg-surface-hover rounded"></div>
                <div className="h-6 w-16 bg-surface-hover rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
