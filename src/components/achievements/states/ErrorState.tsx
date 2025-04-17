
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro ao carregar conquistas</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{error}</p>
        <Button onClick={onRetry} size="sm" variant="outline">
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};
