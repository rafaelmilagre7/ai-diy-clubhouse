
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onExploreClick?: () => void;
}

export const EmptyState = ({ onExploreClick }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-100 shadow-sm animate-fade-in">
      <div className="bg-viverblue/10 p-4 rounded-full mb-4">
        <Trophy className="h-12 w-12 text-viverblue" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Carregando suas conquistas...</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Estamos analisando seu progresso na plataforma para gerar suas conquistas.
        Se nada aparecer em alguns instantes, comece a implementar soluções para desbloquear conquistas.
      </p>
      <Button onClick={onExploreClick} className="bg-viverblue hover:bg-viverblue/90">
        Explorar soluções
      </Button>
    </div>
  );
};
