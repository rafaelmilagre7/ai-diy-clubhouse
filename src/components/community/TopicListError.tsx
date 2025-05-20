
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopicListErrorProps {
  onRetry: () => void;
}

export const TopicListError = ({ onRetry }: TopicListErrorProps) => {
  return (
    <div className="text-center py-8">
      <CircleAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-xl font-medium mb-2">Erro ao carregar tópicos</h3>
      <p className="text-muted-foreground mb-4">Não foi possível carregar os tópicos desta categoria.</p>
      <Button onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
};
