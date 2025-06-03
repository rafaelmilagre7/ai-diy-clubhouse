
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/transitions/PageTransition";
import LoadingScreen from "@/components/common/LoadingScreen";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";

const ImplementationConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState(false);

  // Buscar dados da solução
  const { data: solution, isLoading, error } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da solução não fornecido');
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Mutation para confirmar implementação
  const confirmImplementation = useMutation({
    mutationFn: async () => {
      if (!user || !solution) throw new Error('Dados necessários não disponíveis');

      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          solution_id: solution.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Implementação confirmada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      navigate(`/implementation/${id}/completed`);
    },
    onError: (error) => {
      console.error('Erro ao confirmar implementação:', error);
      toast.error('Erro ao confirmar implementação. Tente novamente.');
    }
  });

  const handleConfirmImplementation = async () => {
    setIsConfirming(true);
    try {
      await confirmImplementation.mutateAsync();
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando solução..." />;
  }

  if (error || !solution) {
    return <NotFoundContent />;
  }

  return (
    <PageTransition>
      <div className="container max-w-3xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/implementation/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Implementação
        </Button>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <CheckCircle className="h-8 w-8" />
              Confirmar Implementação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{solution.title}</h2>
              <p className="text-muted-foreground">{solution.description}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-medium mb-2 text-green-800">
                Ao confirmar esta implementação, você declara que:
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Implementou a solução com sucesso em seu negócio</li>
                <li>• Seguiu todas as etapas recomendadas</li>
                <li>• A solução está funcionando conforme esperado</li>
                <li>• Está satisfeito com os resultados obtidos</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleConfirmImplementation}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isConfirming ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Implementação
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(`/implementation/${id}`)}
                disabled={isConfirming}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ImplementationConfirmation;
