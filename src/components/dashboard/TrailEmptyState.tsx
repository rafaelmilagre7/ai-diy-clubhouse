
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface TrailEmptyStateProps {
  onRegenerate: () => void;
}

export function TrailEmptyState({ onRegenerate }: TrailEmptyStateProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Sua Trilha de Implementação</CardTitle>
        <CardDescription>
          Soluções personalizadas para o seu negócio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 space-y-4">
          <Lightbulb className="h-12 w-12 mx-auto text-[#0ABAB5]" />
          <p className="text-neutral-300">
            Ainda não foi possível gerar uma trilha personalizada para você.
          </p>
          <Button
            onClick={onRegenerate}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Gerar Trilha Personalizada
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
