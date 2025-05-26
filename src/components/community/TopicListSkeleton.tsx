
import { Card } from "@/components/ui/card";

export const TopicListSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-medium">Tópicos</h2>
        <div className="h-10 w-28 bg-muted animate-pulse rounded-md"></div>
      </div>
      
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4 border rounded-md animate-pulse">
          <div className="flex justify-between mb-2">
            <div className="h-6 bg-muted rounded-md w-1/3"></div>
            <div className="h-6 bg-muted rounded-md w-20"></div>
          </div>
          <div className="h-4 bg-muted rounded-md w-1/2"></div>
        </Card>
      ))}
    </div>
  );
};
