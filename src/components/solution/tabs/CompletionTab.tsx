
import React, { useState } from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useSolutionData } from "@/hooks/useSolutionData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface CompletionTabProps {
  solution: Solution;
}

export const CompletionTab = ({ solution }: CompletionTabProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progress } = useSolutionData(solution.id);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteImplementation = async () => {
    if (!user || !progress?.id) {
      toast.error("Erro ao completar implementação");
      return;
    }

    setIsCompleting(true);
    
    try {
      const { error } = await supabase
        .from("progress")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        } as any)
        .eq("id", progress.id as any);

      if (error) throw error;

      toast.success("Parabéns! Implementação concluída com sucesso!");
      navigate(`/implementation/completed/${solution.id}`);
    } catch (error) {
      console.error("Erro ao completar implementação:", error);
      toast.error("Erro ao completar implementação. Tente novamente.");
    } finally {
      setIsCompleting(false);
    }
  };

  const isAlreadyCompleted = progress?.is_completed;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-viverblue/20 to-viverblue/5 border border-viverblue/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <Trophy className="h-6 w-6 text-viverblue" />
            {isAlreadyCompleted ? "Implementação Concluída" : "Finalizar Implementação"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAlreadyCompleted ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  Parabéns! Você completou esta solução
                </h3>
                <p className="text-neutral-300">
                  Sua implementação foi concluída com sucesso. Continue explorando outras soluções para maximizar seus resultados.
                </p>
              </div>
              
              <Button
                onClick={() => navigate("/solutions")}
                className="bg-viverblue hover:bg-viverblue/90"
              >
                <Star className="mr-2 h-4 w-4" />
                Explorar Mais Soluções
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                  Pronto para finalizar?
                </h3>
                <p className="text-neutral-300 mb-6">
                  Ao concluir esta implementação, você estará marcando esta solução como finalizada e poderá acessar seu certificado de conclusão.
                </p>
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-neutral-200">Antes de finalizar, certifique-se de que:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="h-4 w-4 text-viverblue" />
                    Revisou todas as ferramentas necessárias
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="h-4 w-4 text-viverblue" />
                    Baixou todos os materiais relevantes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="h-4 w-4 text-viverblue" />
                    Assistiu aos vídeos explicativos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="h-4 w-4 text-viverblue" />
                    Implementou a solução em seu negócio
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleCompleteImplementation}
                disabled={isCompleting}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
                size="lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isCompleting ? "Finalizando..." : "Concluir Implementação"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
