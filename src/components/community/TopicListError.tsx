
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TopicListErrorProps {
  onRetry: () => void;
}

export const TopicListError = ({ onRetry }: TopicListErrorProps) => {
  return (
    <div className="text-center py-8 space-y-4 border border-red-200 rounded-lg bg-red-50/30 p-6">
      <CircleAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-xl font-medium mb-2">Erro ao carregar tópicos</h3>
      <p className="text-muted-foreground mb-2">
        Não foi possível carregar os tópicos desta categoria devido a um problema de conexão com o servidor.
      </p>
      <Separator className="my-4" />
      <div className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4">
          Tente novamente ou volte mais tarde para conferir as discussões.
        </p>
        <Button 
          onClick={onRetry}
          size="lg"
          className="px-8"
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
};
