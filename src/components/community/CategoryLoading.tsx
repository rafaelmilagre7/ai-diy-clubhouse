
import { Card } from "@/components/ui/card";

export const CategoryLoading = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-6 bg-muted rounded-md w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
