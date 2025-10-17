
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  retryFn?: () => void;
}

export const ErrorState = ({ message, retryFn }: ErrorStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="bg-status-error/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-status-error" />
      </div>
      <h3 className="text-xl font-medium mb-1">Ocorreu um erro</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {retryFn && (
        <Button onClick={retryFn} variant="outline">
          Tentar novamente
        </Button>
      )}
    </div>
  );
};
