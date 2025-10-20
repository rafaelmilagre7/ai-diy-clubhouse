
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, CheckCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationData } from "@/hooks/implementation/useImplementationData";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";

const ImplementationConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Carregar dados da solução
  const { solution, loading: solutionLoading } = useSolutionData(id);
  
  // Carregar dados de implementação
  const { 
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading: implementationLoading 
  } = useImplementationData();
  
  // Hooks de progresso
  const {
    isCompleting,
    handleConfirmImplementation,
    calculateProgress,
  } = useProgressTracking(
    progress, 
    completedModules, 
    setCompletedModules,
    modules.length
  );
  
  // Manipulador para confirmar implementação
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const success = await handleConfirmImplementation();
      
      if (success) {
        // Exibir mensagem de sucesso
        toast({
          title: "Implementação concluída!",
          description: "Parabéns! Você aplicou com sucesso esta solução em seu negócio.",
        });
        
        // Redirecionar para página de certificado ou dashboard
        navigate(`/solution/${id}/completed`);
      }
    } catch (error) {
      console.error("Erro ao confirmar implementação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao confirmar a implementação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/implement/${id}/0`);
  };
  
  if (solutionLoading || implementationLoading) {
    return <LoadingScreen message="Carregando dados da solução..." />;
  }
  
  if (!solution) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Solução não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar a solução solicitada. Verifique o link e tente novamente.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Voltar para Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Confirmar Implementação</CardTitle>
          <CardDescription>
            Você está prestes a confirmar que implementou a solução <span className="font-medium">{solution.title}</span> em seu negócio.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Progresso da implementação</p>
              <p className="text-sm text-muted-foreground">
                {completedModules.length} de {modules.length} etapas concluídas
              </p>
            </div>
            <div className="font-bold text-lg">
              {calculateProgress()}%
            </div>
          </div>
          
          <Progress value={calculateProgress()} className="h-2" />
          
          <div className="p-4 bg-status-success/10 border border-status-success/20 rounded-md">
            <h3 className="font-medium flex items-center text-status-success">
              <CheckCircle className="h-5 w-5 mr-2 text-status-success" />
              Benefícios desta implementação
            </h3>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-success" />
                <span className="text-sm text-status-success/80">Aumento de produtividade no seu negócio</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-success" />
                <span className="text-sm text-status-success/80">Redução de custos operacionais</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-success" />
                <span className="text-sm text-status-success/80">Melhoria na experiência do cliente</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-status-info/10 border border-status-info/20 rounded-md">
            <h3 className="font-medium flex items-center text-status-info">
              <Trophy className="h-5 w-5 mr-2 text-status-info" />
              Ao confirmar, você receberá:
            </h3>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-info" />
                <span className="text-sm text-status-info/80">Certificado de implementação</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-info" />
                <span className="text-sm text-status-info/80">Acesso a materiais exclusivos de otimização</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-1 text-status-info" />
                <span className="text-sm text-status-info/80">Reconhecimento na comunidade VIVER DE IA Club</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Confirmando...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirmar Implementação
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImplementationConfirmation;
